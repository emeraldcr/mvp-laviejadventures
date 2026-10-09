/* Static checks for the local, spreadsheet-derived job board. No browser or database. */
/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "lucide-react") return new Proxy({}, { get: () => function Icon() { return null; } });
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(output.outputText, filename);
};

const { JOB_SEARCH_RECORDS } = require("../app/(page_routes)/cv/data/job-search-records.ts");
const { createDefaultJobs, JOB_TRACKS } = require("../app/(page_routes)/cv/java-react-jobs-data.ts");
const { JAVA_REACT_CAMPAIGN_JOB_KEYS } = require("../app/(page_routes)/cv/data/cv-campaign-java-react.ts");

const jobs = createDefaultJobs();
const variantPaths = new Set([
  "/cv/archive/master",
  "/cv/archive/agentic-ai",
  "/cv/archive/python-react-aws",
  "/cv/archive/python-dotnet",
  "/cv/archive/java",
  "/cv/archive/elasticsearch",
  "/cv/archive/electric-air",
  "/cv/archive/designli",
  ...JAVA_REACT_CAMPAIGN_JOB_KEYS.map((key) => `/cv/archive/java-react-2026/${key}`),
]);

assert.equal(JOB_SEARCH_RECORDS.length, 213, "expected every unique job from the master workbook");
assert.equal(jobs.length, JOB_SEARCH_RECORDS.length, "every imported record must produce one board row");
assert.equal(new Set(jobs.map((job) => job.id)).size, jobs.length, "job IDs must be unique");
assert.equal(JOB_TRACKS.length, 10, "all workbook technical tracks must remain filterable");
assert.ok(jobs.every((job) => job.company && job.title), "every row needs a company and role");
assert.ok(jobs.every((job) => job.applicationSlug.startsWith("job-search/") || job.applicationSlug.startsWith("java-react-2026/")), "application storage keys must stay local and stable");
assert.ok(jobs.every((job) => job.cvPath && variantPaths.has(job.cvPath)), "every CV suggestion must resolve to an existing archive route");
assert.ok(jobs.some((job) => job.match === "tailored"), "company-specific CV matches should be preserved");
assert.ok(jobs.some((job) => job.match === "strong"), "stack-based CV matches should exist");
assert.ok(jobs.some((job) => job.match === "general"), "broad matches must remain visibly general");
assert.equal(jobs.filter((job) => job.initialStatus === "interviewing").length, 1, "the workbook interview must be retained");
assert.equal(jobs.filter((job) => job.initialStatus === "screening").length, 1, "the recruiter contact must be retained");

const counts = jobs.reduce((result, job) => {
  result[job.match] += 1;
  return result;
}, { tailored: 0, strong: 0, general: 0 });

console.log(`PASS ${jobs.length} local jobs, ${JOB_TRACKS.length} tracks, ${counts.tailored} tailored, ${counts.strong} strong, ${counts.general} general CV matches.`);
