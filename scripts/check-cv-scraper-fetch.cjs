/* Offline regression checks for DNS pinning, bounded downloads, and the authenticated API. */
/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS loader mocks Node network modules. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { EventEmitter } = require("node:events");
const { Readable } = require("node:stream");
const zlib = require("node:zlib");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const originalLoad = Module._load;
const originalTs = require.extensions[".ts"];
const originalSetTimeout = global.setTimeout;
const publicIp = "93.184.216.34";
let plans = [];
let dnsAnswers = new Map();
let dnsCalls = [];
let requests = [];
let sockets = [];
let admin = { id: "test", username: "test" };
let parserError = false;

const mockedLookup = async (hostname, options) => {
  dnsCalls.push({ hostname, options });
  const answer = dnsAnswers.get(hostname);
  if (answer instanceof Error) throw answer;
  if (answer === "stall") return new Promise(() => {});
  return answer || [{ address: publicIp, family: 4 }];
};

function mockedRequest(url, options, onResponse) {
  const plan = plans.shift();
  assert.ok(plan, `Unexpected outbound request: ${url}`);
  requests.push({ url: url.href, options });
  const req = new EventEmitter();
  let response;
  const abort = () => {
    const error = Object.assign(new Error("Aborted"), { name: "AbortError" });
    if (response) response.destroy(error);
    req.emit("error", error);
  };
  options.signal.addEventListener("abort", abort, { once: true });
  req.end = () => {
    queueMicrotask(() => {
      if (options.signal.aborted) { abort(); return; }
      if (plan.error) { req.emit("error", plan.error); return; }
      const connect = (error, address, family) => {
        if (error) { req.emit("error", error); return; }
        if (Array.isArray(address)) {
          sockets.push(...address);
        } else {
          sockets.push({ address, family });
        }
        if (plan.stallHeaders) return;
        response = plan.stallBody ? new Readable({ read() {} }) : Readable.from(plan.chunks || [plan.body ?? "<title>Public page</title>"]);
        response.statusCode = plan.status || 200;
        response.headers = { "content-type": "text/html; charset=utf-8", ...plan.headers };
        response.once("close", () => options.signal.removeEventListener("abort", abort));
        onResponse(response);
      };
      if (plan.lookupOptions) {
        options.lookup(options.hostname, plan.lookupOptions, connect);
      } else if (options.hostname.includes(":")) {
        // Node skips lookup for literal IPs; its hostname must have no URL brackets.
        assert.ok(!options.hostname.includes("["));
        connect(null, options.hostname, 6);
      } else {
        options.lookup(options.hostname, { family: 0, all: false }, connect);
      }
    });
  };
  return req;
}

Module._load = function(request, parent, isMain) {
  if (request === "node:dns/promises") return { lookup: mockedLookup };
  if (request === "node:http" || request === "node:https") return { request: mockedRequest };
  if (request === "@/lib/admin-auth") return { getAdminFromRequest: () => admin };
  if (request === "@/lib/cv/scraper/extract") return { extractScrapeResult: (html, url) => {
    if (parserError) throw new Error("Private parser diagnostic");
    return { url, title: html, forms: [], looseFields: [], formCount: 0 };
  } };
  if (request.startsWith("@/")) return originalLoad.call(this, path.join(root, request.slice(2)), parent, isMain);
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
// Only shorten the scraper deadline; stream and Next.js timers keep their normal behavior.
global.setTimeout = (fn, delay, ...args) => originalSetTimeout(fn, delay === 20_000 ? 35 : delay, ...args);

async function main() {
  const { fetchPublicHtml, validateTargetUrl, isPublicAddress, ScrapeError } = require("../lib/cv/scraper/fetch.ts");
  const { GET, POST, runtime } = require("../app/api/scrape/route.ts");
  const { NextRequest } = originalLoad.call(Module, "next/server", module, false);
  let count = 0;
  const reset = () => { plans = []; dnsAnswers = new Map(); dnsCalls = []; requests = []; sockets = []; admin = { id: "test", username: "test" }; parserError = false; };
  const check = async (name, fn) => { reset(); await fn(); count++; console.log(`PASS ${name}`); };
  const fails = async (value, code, status) => {
    await assert.rejects(fetchPublicHtml(value), (error) => error instanceof ScrapeError && error.code === code && (status === undefined || error.status === status));
  };
  const req = (body, options = {}) => new NextRequest("https://cv.example/api/scrape", {
    method: "POST", headers: { "content-type": "application/json", origin: "https://cv.example", ...options.headers },
    body: typeof body === "string" ? body : JSON.stringify(body), signal: options.signal,
  });
  const apiError = async (response, status, code) => {
    assert.equal(response.status, status);
    assert.equal((await response.json()).code, code);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  };

  await check("reserved IPv4, IPv6, mapped and transition addresses are rejected", () => {
    for (const ip of ["0.0.0.0", "10.0.0.1", "127.0.0.1", "100.64.0.1", "100.127.255.254", "169.254.169.254", "172.16.0.1", "172.31.255.254", "192.168.1.1", "192.0.0.1", "192.0.2.1", "192.88.99.1", "198.18.0.1", "198.19.0.1", "198.51.100.1", "203.0.113.1", "224.0.0.1", "255.255.255.255", "::", "::1", "fc00::1", "fe80::1", "ff02::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "64:ff9b::a00:1", "2002:a00:1::", "2001::1", "2001:db8::1", "3fff:fff::1", "fe80::1%eth0", "garbage"]) {
      assert.equal(isPublicAddress(ip), false, ip);
    }
    for (const ip of [publicIp, "8.8.8.8", "172.32.0.1", "100.128.0.1", "2606:4700:4700::1111", "2001:4860:4860::8888"]) assert.equal(isPublicAddress(ip), true, ip);
  });
  await check("protocol, credentials, ports, local names and encoded IP URLs are rejected before DNS", async () => {
    for (const url of ["http://localhost", "http://foo.local", "http://foo.internal", "http://singlelabel", "http://127.1", "http://2130706433", "http://0x7f000001", "http://[::ffff:127.0.0.1]", "https://user:pass@example.com", "https://example.com:8080", "file:///etc/passwd", "javascript:alert(1)", "bad URL", "x".repeat(2049)]) await assert.rejects(fetchPublicHtml(url), ScrapeError);
    assert.equal(requests.length, 0); assert.equal(dnsCalls.length, 0);
    assert.equal(validateTargetUrl("https://example.com/apply#form").href, "https://example.com/apply");
  });
  await check("private or mixed DNS answers and empty answers cannot open a socket", async () => {
    for (const addresses of [[{ address: "10.0.0.1", family: 4 }], [{ address: publicIp, family: 4 }, { address: "::ffff:127.0.0.1", family: 6 }], []]) {
      dnsAnswers.set("example.com", addresses);
      await fails("https://example.com", "UNSAFE_ADDRESS", 400);
    }
    assert.equal(requests.length, 0);
  });
  await check("DNS resolution is pinned, including all-address socket lookup", async () => {
    dnsAnswers.set("example.com", [{ address: publicIp, family: 4 }, { address: "2606:4700:4700::1111", family: 6 }]);
    plans.push({ lookupOptions: { all: true, family: 0 } });
    const result = await fetchPublicHtml("https://example.com/apply#form");
    assert.equal(result.url, "https://example.com/apply"); assert.equal(dnsCalls.length, 1);
    assert.deepEqual(sockets, [{ address: publicIp, family: 4 }, { address: "2606:4700:4700::1111", family: 6 }]);
    dnsAnswers.set("example.com", [{ address: "127.0.0.1", family: 4 }]);
    const pinned = requests[0].options.lookup;
    pinned("example.com", { family: 4 }, (error, address, family) => { assert.equal(error, null); assert.equal(address, publicIp); assert.equal(family, 4); });
    assert.equal(dnsCalls.length, 1);
    assert.equal(requests[0].options.agent, false);
    assert.equal(requests[0].options.headers["Accept-Encoding"], "identity");
  });
  await check("literal public IPv6 uses an unbracketed socket hostname without DNS", async () => {
    plans.push({});
    const result = await fetchPublicHtml("https://[2606:4700:4700::1111]/apply");
    assert.equal(result.url, "https://[2606:4700:4700::1111]/apply");
    assert.equal(dnsCalls.length, 0); assert.equal(sockets[0].address, "2606:4700:4700::1111");
  });
  await check("redirects resolve relative URLs and revalidate every new DNS answer", async () => {
    plans.push({ status: 302, headers: { location: "/jobs/open#apply" } }, { body: "<h1>Job</h1>" });
    const result = await fetchPublicHtml("https://example.com/start");
    assert.equal(result.url, "https://example.com/jobs/open"); assert.equal(dnsCalls.length, 2);
    plans.push({ status: 302, headers: { location: "https://private.example/" } });
    dnsAnswers.set("private.example", [{ address: "192.168.1.1", family: 4 }]);
    await fails("https://example.com", "UNSAFE_ADDRESS", 400);
    assert.equal(requests.length, 3);
  });
  await check("redirects to private literals, other protocols and credentials are blocked", async () => {
    for (const location of ["http://169.254.169.254/latest", "http://[::ffff:127.0.0.1]", "file:///etc/passwd", "https://user:pass@example.com/"]) {
      plans.push({ status: 307, headers: { location } });
      await assert.rejects(fetchPublicHtml("https://example.com"), (error) => error instanceof ScrapeError && error.status === 400);
    }
    assert.equal(requests.length, 4);
  });
  await check("missing, malformed and excessive redirects map to clear errors", async () => {
    plans.push({ status: 301 }); await fails("https://example.com", "INVALID_REDIRECT", 502);
    plans.push({ status: 302, headers: { location: "http://[" } }); await fails("https://example.com", "INVALID_REDIRECT", 502);
    plans.push(...Array.from({ length: 6 }, () => ({ status: 302, headers: { location: "/loop" } })));
    await fails("https://example.com", "TOO_MANY_REDIRECTS", 502);
  });
  await check("HTML media types and character encodings are respected", async () => {
    plans.push({ body: Buffer.from("<p>caf\xe9</p>", "latin1"), headers: { "content-type": "text/html; charset=windows-1252" } });
    assert.equal((await fetchPublicHtml("https://example.com")).html, "<p>café</p>");
    plans.push({ headers: { "content-type": "application/xhtml+xml ; charset=unknown-charset" } });
    assert.ok((await fetchPublicHtml("https://example.com")).html.includes("Public page"));
    plans.push({ headers: { "content-type": "application/pdf" } }); await fails("https://example.com", "NOT_HTML", 415);
    plans.push({ headers: { "content-type": "" } }); await fails("https://example.com", "NOT_HTML", 415);
  });
  await check("gzip, Brotli and deflate work when servers ignore identity", async () => {
    const html = "<h1>Application — café</h1>";
    for (const [encoding, compressor] of [["gzip", zlib.gzipSync], ["br", zlib.brotliCompressSync], ["deflate", zlib.deflateSync]]) {
      plans.push({ body: compressor(html), headers: { "content-encoding": encoding } });
      assert.equal((await fetchPublicHtml("https://example.com")).html, html);
    }
    plans.push({ headers: { "content-encoding": "compress" } }); await fails("https://example.com", "UNSUPPORTED_ENCODING", 502);
    plans.push({ body: "invalid gzip", headers: { "content-encoding": "gzip" } }); await fails("https://example.com", "FETCH_FAILED", 502);
  });
  await check("declared, streamed and decompressed HTML sizes are bounded", async () => {
    plans.push({ headers: { "content-length": String(2 * 1024 * 1024 + 1) } }); await fails("https://example.com", "PAGE_TOO_LARGE", 413);
    plans.push({ chunks: [Buffer.alloc(1024 * 1024), Buffer.alloc(1024 * 1024 + 1)] }); await fails("https://example.com", "PAGE_TOO_LARGE", 413);
    plans.push({ body: zlib.gzipSync(Buffer.alloc(2 * 1024 * 1024 + 1, "a")), headers: { "content-encoding": "gzip" } });
    await fails("https://example.com", "PAGE_TOO_LARGE", 413);
  });
  await check("HTTP blocking, not-found, upstream and DNS failures preserve error contracts", async () => {
    for (const status of [401, 403, 429]) { plans.push({ status }); await fails("https://example.com", "WEBSITE_BLOCKED", 502); }
    plans.push({ status: 404 }); await fails("https://example.com", "UPSTREAM_ERROR", 404);
    plans.push({ status: 503 }); await fails("https://example.com", "UPSTREAM_ERROR", 502);
    dnsAnswers.set("example.com", new Error("private DNS diagnostic")); await fails("https://example.com", "FETCH_FAILED", 502);
  });
  await check("the total deadline covers DNS, response headers and stalled response bodies", async () => {
    dnsAnswers.set("example.com", "stall"); await fails("https://example.com", "SCAN_TIMEOUT", 504);
    dnsAnswers.delete("example.com");
    plans.push({ stallHeaders: true }); await fails("https://example.com", "SCAN_TIMEOUT", 504);
    plans.push({ stallBody: true }); await fails("https://example.com", "SCAN_TIMEOUT", 504);
  });
  await check("client cancellation works before DNS and during streaming", async () => {
    const cancelled = new AbortController(); cancelled.abort();
    await assert.rejects(fetchPublicHtml("https://example.com", cancelled.signal), (error) => error.code === "SCAN_CANCELLED" && error.status === 408);
    assert.equal(requests.length, 0); assert.equal(dnsCalls.length, 0);
    const active = new AbortController(); plans.push({ stallBody: true });
    const promise = fetchPublicHtml("https://example.com", active.signal);
    originalSetTimeout(() => active.abort(), 5);
    await assert.rejects(promise, (error) => error.code === "SCAN_CANCELLED" && error.status === 408);
  });
  await check("API requires admin authentication and same-origin requests before any network access", async () => {
    admin = null;
    await apiError(await POST(req({ url: "https://example.com" })), 401, "ADMIN_REQUIRED");
    await apiError(await GET(new NextRequest("https://cv.example/api/scrape?url=https://example.com")), 401, "ADMIN_REQUIRED");
    admin = { id: "test" };
    await apiError(await POST(req({ url: "https://example.com" }, { headers: { origin: "https://foreign.example" } })), 403, "INVALID_ORIGIN");
    await apiError(await GET(new NextRequest("https://cv.example/api/scrape?url=https://example.com", { headers: { "sec-fetch-site": "cross-site" } })), 403, "INVALID_ORIGIN");
    assert.equal(requests.length, 0);
  });
  await check("API rejects missing, malformed, typed and oversized request bodies", async () => {
    for (const body of [null, {}, { url: 123 }, { url: "" }]) await apiError(await POST(req(body)), 400, "URL_REQUIRED");
    await apiError(await POST(req("not JSON")), 400, "INVALID_BODY");
    await apiError(await POST(req({ url: "https://example.com" }, { headers: { "content-type": "text/plain" } })), 415, "INVALID_CONTENT_TYPE");
    await apiError(await POST(req("x".repeat(8193))), 413, "REQUEST_TOO_LARGE");
    await apiError(await POST(req("{}", { headers: { "content-length": "8193" } })), 413, "REQUEST_TOO_LARGE");
    await apiError(await GET(new NextRequest("https://cv.example/api/scrape")), 400, "URL_REQUIRED");
    assert.equal(requests.length, 0);
  });
  await check("GET and POST share the final-URL parser response and no-store headers", async () => {
    assert.equal(runtime, "nodejs");
    plans.push({ status: 302, headers: { location: "/job" } }, { body: "POST job html" });
    const post = await POST(req({ url: "https://example.com/start" }));
    assert.equal(post.status, 200); assert.equal(post.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await post.json(), { url: "https://example.com/job", title: "POST job html", forms: [], looseFields: [], formCount: 0 });
    plans.push({ body: "GET job html" });
    const get = await GET(new NextRequest("https://cv.example/api/scrape?url=https://example.com/job"));
    assert.equal(get.status, 200); assert.equal((await get.json()).title, "GET job html");
  });
  await check("API maps known errors and hides unexpected parser diagnostics", async () => {
    await apiError(await POST(req({ url: "http://127.0.0.1" })), 400, "UNSAFE_URL");
    plans.push({ status: 403 }); await apiError(await POST(req({ url: "https://example.com" })), 502, "WEBSITE_BLOCKED");
    parserError = true; plans.push({});
    const response = await POST(req({ url: "https://example.com" }));
    assert.equal(response.status, 502); const body = await response.json();
    assert.equal(body.code, "SCAN_FAILED"); assert.ok(!body.error.includes("Private"));
  });
  console.log(`\n${count} CV scraper network/API checks passed. No live websites or browser used.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => {
  Module._load = originalLoad;
  global.setTimeout = originalSetTimeout;
  if (originalTs) require.extensions[".ts"] = originalTs; else delete require.extensions[".ts"];
});
