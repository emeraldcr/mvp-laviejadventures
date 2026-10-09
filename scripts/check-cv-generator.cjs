/* Regression checks for the server pipeline. No browser, live DB, or API calls. */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS loader isolates mocked TypeScript server modules. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const originalLoad = Module._load;
const originalTs = require.extensions[".ts"];
const originalTsx = require.extensions[".tsx"];
const oldKey = process.env.OPENAI_API_KEY;
const databases = new Map();
let admin = { id: "cv-test-admin", username: "test" };
let responses = [];
let modelCalls = 0;
const icons = new Map();
const mockIcons = new Proxy({}, { get: (_target, name) => { if (!icons.has(name)) icons.set(name, function Icon() { return null; }); return icons.get(name); } });
const matches = (record, query) => Object.entries(query).every(([key, value]) => value && typeof value === "object" && "$lte" in value ? record[key] <= value.$lte : record[key] === value);
const db = { collection(name) {
  if (!databases.has(name)) databases.set(name, new Map());
  const records = databases.get(name);
  return {
    async findOneAndUpdate(query, update, options) {
      const record = [...records.values()].find((item) => matches(item, query));
      if (record) { Object.assign(record, update.$set); return record; }
      if (options.upsert) {
        if (records.has(query._id)) throw Object.assign(new Error("duplicate"), { code: 11000 });
        records.set(query._id, { _id: query._id, ...update.$set });
      }
      return null;
    },
    async insertOne(record) { records.set(record._id, structuredClone(record)); return { insertedId: record._id }; },
    async deleteOne(query) { const record = [...records.values()].find((item) => matches(item, query)); if (record) records.delete(record._id); },
    async updateOne(query, update, options = {}) { let record = [...records.values()].find((item) => matches(item, query)); if (!record && options.upsert) { record = { _id: query._id }; records.set(query._id, record); } if (!record) return;
      Object.assign(record, structuredClone(update.$set ?? {}));
      for (const [key, value] of Object.entries(update.$push ?? {})) record[key].push(structuredClone(value));
    },
    async findOne(query) { return structuredClone([...records.values()].find((item) => matches(item, query)) ?? null); },
    find(query) {
      let items = [...records.values()].filter((item) => matches(item, query));
      return { sort() { items.sort((a, b) => b.createdAt - a.createdAt); return this; }, limit(count) { items = items.slice(0, count); return this; }, async toArray() { return structuredClone(items); } };
    },
  };
} };
class MockOpenAI {
  responses = { create: async () => {
    modelCalls++;
    const item = responses.shift();
    if (!item) throw new Error("Unexpected model call");
    if (item instanceof Error) throw item;
    return { id: `mock-${modelCalls}`, model: "mock-model", status: "completed", output_text: JSON.stringify(item), output: [{ content: item }], usage: { input_tokens: 100, output_tokens: 100, total_tokens: 200 }, ...item.__response };
  } };
}
Module._load = function(request, parent, isMain) {
  if (request === "openai") return MockOpenAI;
  if (request === "lucide-react") return mockIcons;
  if (request === "@/lib/helpers/mongodb") return { getDb: async () => db };
  if (request === "@/lib/admin-auth") return { getAdminFromRequest: () => admin };
  if (request.startsWith("@/")) return originalLoad.call(this, path.join(root, request.slice(2)), parent, isMain);
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } });
  module._compile(output.outputText, filename);
};
require.extensions[".tsx"] = require.extensions[".ts"];

async function main() {
  const { cleanJobDescription } = require("../lib/cv/jd.ts");
  const { buildCvSources } = require("../lib/cv/sources.ts");
  const { assembleCv, validateJobDescription } = require("../lib/cv/validate.ts");
  const store = require("../lib/cv/store.ts");
  const { generateCv } = require("../lib/cv/generate.ts");
  const { extractLocalJobDescription, buildLocalCv, containsTerm } = require("../lib/cv/engine.ts");
  const { defaultCvProfile, validateCvProfile, saveCvProfile, loadCvSources } = require("../lib/cv/profile.ts");
  const profileApi = require("../app/api/cv/profile/route.ts");
  const { POST } = require("../app/api/cv/generate/route.ts");
  const { GET } = require("../app/api/cv/generations/route.ts");
  const { NextRequest } = require("next/server");
  const { VARIANT_CV } = require("../app/(page_routes)/cv/data/cv-data.ts");
  const { cvVariants } = require("../app/(page_routes)/cv/variants.ts");
  const routes = require("../app/(page_routes)/cv/[...slug]/page.tsx");
  let count = 0;
  const check = async (name, fn) => { await fn(); count++; console.log(`PASS ${name}`); };
  const pasted = "Senior Software Engineer\nAcme\nBuild React applications and TypeScript interfaces with REST APIs. Experience collaborating on production software, testing, code review and cloud delivery is required. Familiarity with Rust is preferred.";
  const jd = { isJobDescription: true, title: "Senior Software Engineer", company: "Acme", cleanedText: pasted, keywords: [
    { term: "React", quote: "Build React applications", priority: "required" }, { term: "Rust", quote: "Familiarity with Rust is preferred.", priority: "preferred" },
  ], responsibilities: ["Build React applications."] };
  const sources = buildCvSources();
  const shortProof = sources.evidence.find((item) => item.zone === "summary" && item.text.split(/\s+/).length < 70);
  const react = sources.skills.find((item) => item.text === "React");
  const typescript = sources.skills.find((item) => item.text === "TypeScript");
  const draft = { headline: "Senior Full-Stack Engineer", summary: [{ text: shortProof.text, evidenceIds: [shortProof.id] }],
    skillGroups: [{ label: "Frontend", skillIds: [react.id] }, { label: "Languages", skillIds: [typescript.id] }],
    experience: sources.jobs.map((job) => { const proof = sources.evidence.find((item) => item.jobId === job.id && item.text.split(/\s+/).length <= 40); assert.ok(proof, `Missing short evidence for ${job.id}`); return { jobId: job.id, bullets: [{ text: proof.text, evidenceIds: [proof.id] }] }; }),
    keywordMatches: [{ term: "React", evidenceIds: [], skillIds: [react.id] }],
  };
  const changeDraft = (change) => { const copy = structuredClone(draft); change(copy); return copy; };
  const request = (body, origin = "https://cv.example") => new NextRequest("https://cv.example/api/cv/generate", { method: "POST", headers: { "content-type": "application/json", origin }, body: typeof body === "string" ? body : JSON.stringify(body) });
  process.env.OPENAI_API_KEY = "test-only-key";

  await check("HTML and copied navigation are removed while requirements survive", () => {
    const cleaned = cleanJobDescription(`<nav>Other jobs</nav><script>steal secrets</script><style>bad</style><h1>Senior Software Engineer</h1><p>${pasted}</p><p>Easy Apply</p><p>Privacy Policy</p>`);
    assert.ok(cleaned.includes("TypeScript")); assert.ok(!/steal|bad|Easy Apply|Privacy Policy|Other jobs/.test(cleaned));
  });
  await check("plain-text duplicates and buttons are removed", () => {
    const cleaned = cleanJobDescription(`Sign in\n${pasted}\nSave job\nSenior Software Engineer\nhttps://example.com`);
    assert.equal(cleaned, pasted);
  });
  await check("invalid, short and oversized input is rejected", () => { for (const value of [null, {}, "React", "a".repeat(40_001)]) assert.throws(() => cleanJobDescription(value)); });
  await check("keyword quotes must exist in the input and unrelated input is rejected", () => {
    assert.equal(validateJobDescription(jd, pasted).keywords.length, 2);
    assert.throws(() => validateJobDescription({ ...jd, isJobDescription: false }, pasted));
    assert.throws(() => validateJobDescription({ ...jd, keywords: [{ ...jd.keywords[0], quote: "invented quotation" }] }, pasted));
  });
  await check("sources exclude Oscar, retain all Allan variants, and have stable IDs", () => {
    assert.ok(!sources.archiveSlugs.includes("oscar-cocinero"));
    assert.equal(sources.archiveSlugs.length, Object.values(VARIANT_CV).filter((cv) => cv.personalInfo.name === sources.base.personalInfo.name).length);
    assert.equal(buildCvSources().version, sources.version);
    assert.equal(new Set(sources.evidence.map((item) => item.id)).size, sources.evidence.length);
  });
  await check("all old CV navigation points into the archive", () => { assert.equal(cvVariants.length, Object.keys(VARIANT_CV).length); for (const variant of cvVariants) { assert.ok(variant.archivedByDefault); assert.equal(variant.path, `/cv/archive/${variant.slug || "master"}`); } });
  await check("archive, feature and generated routes remain addressable", async () => {
    assert.equal(routes.dynamicParams, true);
    const paths = new Set(routes.generateStaticParams().map((item) => item.slug.join("/")));
    assert.ok(paths.has("archive/master")); assert.ok(paths.has("archive/oscar-cocinero"));
    for (const feature of ["archive", "stats", "java-react-jobs", "cover-letter"]) assert.ok(paths.has(feature));
    for (const variant of cvVariants) assert.ok(paths.has(`archive/${variant.slug || "master"}`));
    assert.equal((await routes.generateMetadata({ params: Promise.resolve({ slug: ["generated", "private-id"] }) })).robots.index, false);
    await assert.rejects(() => routes.default({ params: Promise.resolve({ slug: ["java"] }) }), /NEXT_REDIRECT/);
    await assert.rejects(() => routes.default({ params: Promise.resolve({ slug: ["archive", "missing-cv"] }) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
  });
  await check("assembly preserves identity, chronology and source data; gaps remain gaps", () => {
    const before = JSON.stringify(sources);
    const result = assembleCv(sources, jd, draft);
    assert.deepEqual(result.gaps, ["Rust"]);
    assert.deepEqual(result.cv.contactInfo, sources.base.contactInfo); assert.deepEqual(result.cv.education, sources.base.education); assert.deepEqual(result.cv.languages, sources.base.languages);
    assert.deepEqual(result.cv.experience.map(({ bullets: _bullets, ...job }) => job), sources.base.experience.map(({ bullets: _bullets, ...job }) => job));
    assert.equal(JSON.stringify(sources), before); assert.ok(result.evidence.length > 0);
  });
  await check("unknown skill IDs and duplicate skills are rejected", () => {
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.skillGroups[0].skillIds = ["invented-rust-skill"]; })));
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.skillGroups[1].skillIds = [react.id]; })));
  });
  await check("experience cannot borrow another employer's evidence", () => {
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.experience[0].bullets[0].evidenceIds = copy.experience[1].bullets[0].evidenceIds; })));
  });
  await check("invented metrics and missing employment are rejected", () => {
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.summary[0].text += " Reduced latency by 999%."; })));
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.experience.pop(); })));
  });
  await check("made-up keyword matches and empty evidence are rejected", () => {
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.keywordMatches[0].term = "InventedTerm"; })));
    assert.throws(() => assembleCv(sources, jd, changeDraft((copy) => { copy.summary[0].evidenceIds = []; })));
  });
  await check("atomic lock prevents overlapping generation and can be released", async () => {
    const first = await store.createGeneration(admin.id, pasted, "mock", sources); assert.ok(first);
    assert.equal(await store.createGeneration(admin.id, pasted, "mock", sources), null);
    await store.releaseGeneration(admin.id, first);
    const second = await store.createGeneration(admin.id, pasted, "mock", sources); assert.ok(second); await store.releaseGeneration(admin.id, second);
  });
  await check("saved CV records enforce owner isolation", async () => {
    const id = await store.createGeneration("other-owner", pasted, "mock", sources);
    assert.equal(await store.getGeneration(admin.id, id), null);
    assert.ok(await store.getGeneration("other-owner", id));
    assert.ok(!(await store.listGenerations(admin.id)).some((item) => item.id === id));
    await store.releaseGeneration("other-owner", id);
  });
  await check("expired locks recover and interrupted attempts show retry state", async () => {
    const id = await store.createGeneration("expired-owner", pasted, "mock", sources);
    databases.get("cv_generation_locks").get("expired-owner").expiresAt = new Date(Date.now() - 1);
    databases.get("cv_generations").get(id).updatedAt = new Date(Date.now() - 250_000);
    assert.equal((await store.getGeneration("expired-owner", id)).status, "error");
    assert.equal((await store.listGenerations("expired-owner"))[0].status, "error");
    const next = await store.createGeneration("expired-owner", pasted, "mock", sources); assert.ok(next); await store.releaseGeneration("expired-owner", next);
  });
  await check("local pipeline saves a complete CV without calling a provider", async () => {
    const id = await store.createGeneration(admin.id, pasted, "mock", sources);
    await generateCv(id, pasted, sources);
    const record = databases.get("cv_generations").get(id);
    assert.equal(record.status, "complete"); assert.equal(record.progress, "complete"); assert.deepEqual(record.calls, []);
    assert.equal(record.sourceSnapshot.version, sources.version); assert.equal(record.result.method, "local");
    assert.ok(record.result.gaps.includes("Rust")); assert.equal(modelCalls, 0); await store.releaseGeneration(admin.id, id);
  });
  await check("generation route rejects unauthenticated, cross-origin and malformed input", async () => {
    const before = modelCalls; const savedAdmin = admin; admin = null;
    assert.equal((await POST(request({ jobDescription: pasted }))).status, 401);
    assert.equal((await GET(new NextRequest("https://cv.example/api/cv/generations"))).status, 401);
    admin = savedAdmin;
    assert.equal((await POST(request({ jobDescription: pasted }, "https://evil.example"))).status, 403);
    assert.equal((await POST(request("{bad json"))).status, 400);
    assert.equal(modelCalls, before);
  });
  await check("non-job content is rejected, saved, and releases the lock", async () => {
    const response = await POST(request({ jobDescription: "This is an unrelated personal story about walking through a forest, enjoying the birds and taking some photographs on a pleasant weekend afternoon with friends." })); assert.equal(response.status, 400);
    const data = await response.json(); const record = databases.get("cv_generations").get(data.id);
    assert.equal(record.status, "error"); assert.equal(record.result, null); assert.equal(record.calls.length, 0);
    assert.ok(!databases.get("cv_generation_locks").has(admin.id));
  });
  await check("generation succeeds without any OpenAI API key", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await POST(request({ jobDescription: pasted })); assert.equal(response.status, 201);
    const data = await response.json(); const record = databases.get("cv_generations").get(data.id);
    assert.equal(record.calls.length, 0); assert.equal(record.status, "complete"); assert.equal(record.result.method, "local"); assert.equal(modelCalls, 0);
  });
  await check("successful POST returns a durable URL and history returns saved metadata", async () => {
    const response = await POST(request({ jobDescription: pasted })); assert.equal(response.status, 201);
    const data = await response.json(); assert.equal(data.url, `/cv/generated/${data.id}`);
    assert.equal((await store.getGeneration(admin.id, data.id)).result.cv.personalInfo.name, sources.base.personalInfo.name);
    const history = await GET(new NextRequest("https://cv.example/api/cv/generations")); assert.equal(history.status, 200);
    const body = await history.json(); assert.ok(body.generations.some((item) => item.id === data.id)); assert.ok(!("sourceSnapshot" in body.generations[0]));
  });
  await check("local keyword extraction retains quotes and rejects invented version matches", () => {
    const description = "Acme\nSenior Software Engineer\nRequirements\nBuild Python 99 applications using React and Rust. Experience shipping reliable production systems and collaborating on code review is required.";
    const local = extractLocalJobDescription(description);
    assert.equal(local.company, "Acme"); assert.ok(local.keywords.some((keyword) => keyword.term === "Python 99"));
    const result = buildLocalCv(sources, local); assert.ok(result.gaps.includes("Python 99")); assert.ok(result.gaps.includes("Rust"));
  });
  await check("aliases preserve genuine support without inferring related products", () => {
    assert.ok(containsTerm("Cloud deployments using GCP", "Google Cloud"));
    assert.ok(containsTerm("Large language models and retrieval augmented generation", "LLM"));
    assert.ok(containsTerm("PostgreSQL data services", "Postgres"));
    assert.ok(!containsTerm("Vector database integrations", "Pinecone"));
    assert.ok(!containsTerm("Python application development", "Python 99"));
  });
  await check("supported archive facts remain distinct from omitted output keywords", () => {
    const local = extractLocalJobDescription("Acme\nStaff Software Engineer, AI Engineering\nRequirements\nBuild Java and Python services with React, LangGraph, LLM and RAG. Experience with Google Cloud, AWS and code reviews is required. Familiarity with Rust is preferred.");
    const result = buildLocalCv(sources, local);
    for (const term of ["LangGraph", "Google Cloud", "code reviews"]) {
      assert.ok(result.draft.keywordMatches.some((match) => match.term === term), `${term} lost real source support`);
      assert.ok(!result.gaps.includes(term));
    }
    assert.ok(result.gaps.includes("Rust"));
    const printedSkills = [...result.cv.primarySkills, ...result.cv.secondarySkills].flatMap((group) => group.items).join("\n");
    assert.ok(containsTerm(printedSkills, "LangGraph"));
    assert.ok(result.omittedKeywords.every((term) => result.draft.keywordMatches.some((match) => match.term === term)));
  });
  await check("different roles choose different real skills and employer evidence", () => {
    const frontend = buildLocalCv(sources, extractLocalJobDescription("Acme\nSenior Frontend React Developer\nRequirements\nBuild accessible React and TypeScript interfaces with Next.js. Experience delivering responsive applications, UI performance, CSS and frontend testing is required."));
    const ai = buildLocalCv(sources, extractLocalJobDescription("Acme\nSenior AI Engineer\nRequirements\nBuild agent workflows using LangGraph, RAG, LLM and tool calling. Experience deploying AI applications, evaluations and reliable backend services is required."));
    assert.notDeepEqual(frontend.draft.skillGroups, ai.draft.skillGroups);
    assert.notDeepEqual(frontend.draft.experience[0].bullets, ai.draft.experience[0].bullets);
    assert.deepEqual(frontend.cv.experience.map((job) => job.company), ai.cv.experience.map((job) => job.company));
    assert.equal(modelCalls, 0);
  });
  await check("profile seeds can be saved, and new facts drive future CVs", async () => {
    const profile = validateCvProfile(defaultCvProfile(sources), sources);
    profile.skillGroups.push({ label: "New confirmed skills", items: ["Rust"] });
    profile.experience[0].bullets.push("Built Rust services supporting production application workflows.");
    await saveCvProfile(admin.id, profile);
    const learned = await loadCvSources(admin.id);
    assert.notEqual(learned.version, sources.version);
    const result = buildLocalCv(learned, extractLocalJobDescription(pasted));
    assert.ok(!result.gaps.includes("Rust")); assert.ok(result.draft.keywordMatches.some((match) => match.term === "Rust"));
    assert.ok(result.evidence.some((proof) => proof.archives.includes("profile")));
    assert.ok(!learned.evidence.some((proof) => proof.archives.some((slug) => slug !== "profile")));
  });
  await check("profile corrections replace deleted facts without mixing admin accounts", async () => {
    const learned = await loadCvSources(admin.id);
    const other = await loadCvSources("separate-admin");
    assert.notEqual(learned.version, other.version); assert.equal(other.version, sources.version);
    const minimal = defaultCvProfile(sources);
    minimal.skillGroups = [{ label: "Frontend", items: ["React", "TypeScript"] }];
    minimal.experience[0].bullets = ["Built React interfaces for client-facing application workflows."];
    const corrected = buildCvSources(validateCvProfile(minimal, sources));
    assert.equal(corrected.skills.length, 2); assert.ok(!corrected.evidence.filter((proof) => proof.jobId === sources.jobs[0].id).some((proof) => proof.text.includes("131")));
    assert.ok(buildLocalCv(corrected, extractLocalJobDescription(pasted)).gaps.includes("Rust"));
  });
  await check("profile validation blocks missing jobs and long claims", () => {
    const profile = defaultCvProfile(sources);
    assert.throws(() => validateCvProfile({ ...profile, experience: [] }));
    profile.experience[0].bullets = ["claim ".repeat(41)]; assert.throws(() => validateCvProfile(profile));
    const duplicates = defaultCvProfile(sources);
    duplicates.skillGroups = [{ label: "One", items: ["React"] }, { label: "Two", items: ["react"] }];
    assert.throws(() => validateCvProfile(duplicates));
  });
  await check("profile API requires authentication and validates request origin", async () => {
    const savedAdmin = admin; admin = null;
    assert.equal((await profileApi.GET(new NextRequest("https://cv.example/api/cv/profile"))).status, 401);
    assert.equal((await profileApi.PUT(request({}))).status, 401);
    admin = savedAdmin;
    assert.equal((await profileApi.PUT(request({}, "https://evil.example"))).status, 403);
    assert.equal((await profileApi.PUT(request({}))).status, 400);
    const result = await profileApi.GET(new NextRequest("https://cv.example/api/cv/profile")); assert.equal(result.status, 200); assert.ok((await result.json()).profile);
  });
  console.log(`\n${count} local CV generator regression checks passed. In-memory persistence; zero provider calls.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => {
  Module._load = originalLoad;
  if (originalTs) require.extensions[".ts"] = originalTs; else delete require.extensions[".ts"];
  if (originalTsx) require.extensions[".tsx"] = originalTsx; else delete require.extensions[".tsx"];
  if (oldKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldKey;
});
