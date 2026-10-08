/* HTML parser regressions: offline fixtures, no browser or network requests. */
/* eslint-disable @typescript-eslint/no-require-imports -- Load the TypeScript parser without a separate test build. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const originalTs = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(output.outputText, filename);
};
const { extractScrapeResult } = require("../lib/cv/scraper/extract.ts");
require.extensions[".ts"] = originalTs;
const base = "https://careers.example.com/jobs/engineer";
let count = 0;
const check = (name, run) => { run(); count++; console.log(`PASS ${name}`); };

check("labels with CSS punctuation, wrapped labels, ARIA references and external ownership", () => {
  const result = extractScrapeResult(`<form id="apply:x[0]" action="../submit" method="POST">
    <label for="person:email[0]">Email &amp; contact</label><input id="person:email[0]" name="email" type="email" required>
    <label>Full name <input name="name" placeholder="As on your CV"></label>
    <span id="label:one[0]">Professional</span><span id="label:two[0]">website</span><input aria-labelledby="label:one[0] label:two[0]" aria-label="Wrong fallback" name="site" type="url">
    <input name="phone" aria-label="Telephone" type="tel"><button>Apply now</button>
  </form><input form="apply:x[0]" name="portfolio" aria-label="Portfolio"><input form="missing" name="orphan">`, base);
  assert.equal(result.formCount, 1);
  assert.equal(result.forms[0].index, 1);
  assert.equal(result.forms[0].action, "https://careers.example.com/submit");
  assert.equal(result.forms[0].method, "POST");
  assert.deepEqual(result.forms[0].fields.map((field) => field.label), ["Email & contact", "Full name", "Professional website", "Telephone", "Apply now", "Portfolio"]);
  assert.equal(result.forms[0].fields[0].required, true);
  assert.equal(result.forms[0].fields[1].placeholder, "As on your CV");
  assert.equal(result.looseFields[0].name, "orphan");
});

check("select defaults, textareas, checkbox flags and disabled fieldsets", () => {
  const result = extractScrapeResult(`<form><fieldset disabled><legend><input name="legend" value="enabled"></legend><input name="locked" readonly value="disabled"></fieldset>
    <select name="country"><option disabled value="choose">Choose</option><option value="cr">Costa Rica</option><option value="us">USA</option></select>
    <select name="skills" multiple><optgroup disabled><option selected value="x">Blocked</option></optgroup><option selected value="ts">TypeScript</option></select>
    <select name="listbox" size="3"><option value="a">A</option><option value="b">B</option></select>
    <textarea name="cover" required>First line\nSecond &amp; third</textarea>
    <input type="checkbox" name="agree" checked><input type="radio" name="choice"><input type="unknown" name="fallback">
  </form>`, base);
  const fields = Object.fromEntries(result.forms[0].fields.map((field) => [field.name, field]));
  assert.equal(fields.legend.disabled, false);
  assert.equal(fields.locked.disabled, true);
  assert.equal(fields.locked.readOnly, true);
  assert.equal(fields.country.value, "cr");
  assert.deepEqual(fields.country.options.map((option) => option.selected), [false, true, false]);
  assert.equal(fields.skills.multiple, true);
  assert.equal(fields.skills.value, "x, ts");
  assert.equal(fields.skills.options[0].disabled, true);
  assert.equal(fields.listbox.value, "");
  assert.ok(fields.listbox.options.every((option) => !option.selected));
  assert.equal(fields.cover.value, "First line\nSecond & third");
  assert.equal(fields.cover.required, true);
  assert.equal(fields.agree.checked, true);
  assert.equal(fields.agree.value, "on");
  assert.equal(fields.choice.checked, false);
  assert.equal(fields.fallback.type, "text");
});

check("password, hidden, credential and file values never appear in the output", () => {
  const result = extractScrapeResult(`<form><input type="password" value="SENSITIVE_PASSWORD"><input type="hidden" value="SENSITIVE_CSRF">
    <input name="access_token" value="SENSITIVE_ACCESS"><textarea id="clientSecret">SENSITIVE_SECRET</textarea>
    <input name="otp" autocomplete="one-time-code" value="SENSITIVE_OTP"><input type="file" value="SENSITIVE_LOCAL_PATH" accept=".pdf" multiple>
    <select name="api_key"><option selected value="SENSITIVE_OPTION_VALUE">SENSITIVE_OPTION_TEXT</option></select>
  </form>`, base);
  assert.equal(result.forms[0].fields.length, 7);
  assert.ok(result.forms[0].fields.every((field) => field.value === null));
  assert.ok(!JSON.stringify(result).includes("SENSITIVE_"));
  assert.ok(result.warnings.some((warning) => /redacted/.test(warning)));
});

check("readable text excludes navigation, executable content, hidden content and form values", () => {
  const result = extractScrapeResult(`<head><title>Engineer &amp; Developer</title><meta name="DESCRIPTION" content="Build useful software"></head>
    <body><header>HEADER_ONLY</header><nav>NAV_ONLY</nav><main><h1>Build your career</h1><p>React <strong>and TypeScript</strong>.</p><ul><li>Work remotely</li><li>Help customers</li></ul>
    <script>EXECUTABLE_ONLY</script><style>STYLE_ONLY</style><aside>ASIDE_ONLY</aside><p hidden>HIDDEN_ONLY</p><p aria-hidden="true">ARIA_HIDDEN_ONLY</p><p style="display: none">CSS_HIDDEN_ONLY</p>
    <textarea>FORM_VALUE_ONLY</textarea><select><option>OPTION_ONLY</option></select></main><footer>FOOTER_ONLY</footer></body>`, base);
  assert.equal(result.title, "Engineer & Developer");
  assert.equal(result.description, "Build useful software");
  assert.equal(result.pageText, "Build your career\n\nReact and TypeScript.\n\nWork remotely\n\nHelp customers");
  assert.ok(!result.pageText.includes("_ONLY"));
  assert.ok(result.warnings.some((warning) => /JavaScript/.test(warning)));
  assert.ok(result.warnings.some((warning) => /No HTML forms/.test(warning)));
});

check("only safe HTTP links and form actions are returned with relative URLs resolved", () => {
  const result = extractScrapeResult(`<a href="../openings?team=web#top">Openings</a><a href="../openings?team=web">Duplicate</a><a href="#local">Same page</a>
    <a href="javascript:alert(1)">Script</a><a href="mailto:jobs@example.com">Email</a><a href="http://127.0.0.1/admin">Private IP</a><a href="http://192.168.1.1/">LAN</a><a href="http://localhost/">Local</a>
    <a href="http://[::1]/">Local v6</a><a href="https://user:password@example.com/">Credentials</a><a href="https://public.example.com:8443/">Unsafe port</a>
    <a href="//apply.example.com/start" aria-label="Apply externally"></a><form action="http://10.0.0.1/submit"></form>`, base);
  assert.deepEqual(result.links, [{ text: "Openings", url: "https://careers.example.com/openings?team=web" }, { text: "Apply externally", url: "https://apply.example.com/start" }]);
  assert.equal(result.forms[0].action, null);
  assert.ok(result.warnings.some((warning) => /form action/.test(warning)));
});

check("JobPosting is extracted from nested graph and arrays, without inventing metadata", () => {
  const job = { "@type": ["Thing", "https://schema.org/JobPosting"], title: "Frontend Engineer", hiringOrganization: { name: "Acme" }, jobLocation: [{ "@type": "Place", address: { addressLocality: "San Carlos", addressRegion: "Alajuela", addressCountry: { name: "Costa Rica" } } }], employmentType: ["FULL_TIME", "REMOTE"], datePosted: "2026-10-01", validThrough: "2026-11-01", description: "<p>Build <b>React</b> interfaces.</p><ul><li>Test releases.</li></ul><script>SECRET_SCRIPT</script>", url: "../frontend", baseSalary: { currency: "USD", value: { minValue: 100, maxValue: 200, unitText: "HOUR" } } };
  const json = JSON.stringify({ "@graph": [{ nested: [job] }, job, { "@type": "JobPosting", title: "Remote role", jobLocationType: "TELECOMMUTE", description: "Remote position", url: "http://localhost/private" }] }).replace(/</g, "\\u003c");
  const result = extractScrapeResult(`<script type="application/ld+json">${json}</script>`, base);
  assert.equal(result.jobPostings.length, 2);
  assert.deepEqual(result.jobPostings[0], { title: "Frontend Engineer", company: "Acme", location: "San Carlos, Alajuela, Costa Rica", employmentType: "FULL_TIME, REMOTE", datePosted: "2026-10-01", validThrough: "2026-11-01", description: "Build React interfaces.\n\nTest releases.", url: "https://careers.example.com/frontend", salary: "USD 100–200 HOUR" });
  assert.equal(result.jobPostings[1].location, "Remote");
  assert.equal(result.jobPostings[1].company, null);
  assert.equal(result.jobPostings[1].salary, null);
  assert.equal(result.jobPostings[1].url, null);
  assert.ok(!result.warnings.some((warning) => warning.startsWith("JavaScript")));
});

check("malformed JSON-LD and embedded forms produce useful warnings without breaking extraction", () => {
  const result = extractScrapeResult(`<h1>Public job page</h1><script type="application/ld+json">{"@type": "JobPosting", invalid}</script><iframe src="https://apply.example.com"></iframe><input aria-label="Search" name="q">`, base);
  assert.equal(result.title, "Public job page");
  assert.equal(result.jobPostings.length, 0);
  assert.equal(result.looseFields[0].label, "Search");
  assert.ok(result.warnings.some((warning) => /invalid JSON/.test(warning)));
  assert.ok(result.warnings.some((warning) => /Embedded frames/.test(warning)));
  assert.ok(!Number.isNaN(Date.parse(result.scannedAt)));
});

check("document base URLs resolve relative destinations and reject private targets", () => {
  const result = extractScrapeResult(`<base href="https://ats.example.com/apply/"><a href="next">Next</a><form action="submit"></form><form></form><script type="application/ld+json">{"@type":"JobPosting","title":"Engineer","url":"role"}</script>`, base);
  assert.equal(result.links[0].url, "https://ats.example.com/apply/next");
  assert.equal(result.forms[0].action, "https://ats.example.com/apply/submit");
  assert.equal(result.forms[1].action, base);
  assert.equal(result.jobPostings[0].url, "https://ats.example.com/apply/role");
  const unsafe = extractScrapeResult(`<base href="http://127.0.0.1/admin/"><a href="next">Private</a><a href="https://public.example.com/apply">Public</a><form action="submit"></form>`, base);
  assert.equal(unsafe.links.length, 1);
  assert.equal(unsafe.links[0].url, "https://public.example.com/apply");
  assert.equal(unsafe.forms[0].action, null);
  assert.ok(unsafe.warnings.some((warning) => /document base/.test(warning)));
});

check("forms, fields, options, links and text are bounded with explicit truncation warnings", () => {
  const result = extractScrapeResult(`${Array.from({ length: 45 }, (_, index) => `<form id="f${index}"><input name="f${index}"></form>`).join("")}
    <select>${Array.from({ length: 105 }, (_, index) => `<option>${index}</option>`).join("")}</select>
    ${Array.from({ length: 350 }, (_, index) => `<input name="loose${index}" value="data">`).join("")}
    ${Array.from({ length: 90 }, (_, index) => `<a href="/jobs/${index}">Job ${index}</a>`).join("")}<p>${"Readable text ".repeat(3000)}</p>`, base);
  assert.equal(result.formCount, 45);
  assert.equal(result.forms.length, 40);
  assert.equal(result.looseFields[0].options.length, 100);
  assert.equal(result.forms.reduce((total, form) => total + form.fields.length, 0) + result.looseFields.length, 295);
  assert.equal(result.links.length, 80);
  assert.equal(result.pageText.length, 24000);
  for (const noun of ["Forms", "Fields", "Select options", "Links", "Page text"]) assert.ok(result.warnings.some((warning) => warning.startsWith(noun)), noun);
});

console.log(`Passed ${count} CV scraper extraction checks.`);
