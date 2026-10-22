/* Regression tests run without a browser or live payment: node --test scripts/paypal.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quiet = { error() {}, log() {}, warn() {} };
function load(file, imports = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, require: (name) => {
      if (name in imports) return imports[name];
      throw new Error(`Unexpected dependency: ${name}`);
    }, URLSearchParams: globalThis.URLSearchParams, URL: globalThis.URL, AbortSignal: globalThis.AbortSignal, console: quiet, Error, SyntaxError, ...globals,
  }, { filename: file });
  return module.exports;
}
function dom() {
  const scripts = [];
  const timers = new Map();
  let nextTimer = 0;
  class Element extends globalThis.EventTarget {
    constructor() { super(); this.isConnected = false; this.children = []; }
    replaceChildren(...children) { this.children = children; children.forEach((node) => { node.isConnected = this.isConnected; }); }
    remove() { this.isConnected = false; const index = scripts.indexOf(this); if (index >= 0) scripts.splice(index, 1); }
  }
  const document = {
    createElement: () => new Element(),
    querySelector: () => scripts[0] ?? null,
    body: { appendChild(node) { scripts.push(node); node.isConnected = true; } },
  };
  return { document, window: {}, scripts, Element, timers,
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
}
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function hooks() {
  const slots = [];
  let cursor = 0, dirty = false;
  const queued = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useState(initial) {
      const i = cursor++;
      slots[i] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, (next) => {
        const value = typeof next === 'function' ? next(slots[i].value) : next;
        if (!Object.is(value, slots[i].value)) { slots[i].value = value; dirty = true; }
      }];
    },
    useRef(initial) { const i = cursor++; return (slots[i] ??= { current: initial }); },
    useMemo(fn, deps) {
      const i = cursor++;
      if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { value: fn(), deps };
      return slots[i].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!slots[i] || !same(slots[i].deps, deps)) queued.push(() => {
        slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn(), effect: true };
      });
    },
  };
  return { react,
    render(fn) { cursor = 0; dirty = false; const result = fn(); queued.splice(0).forEach((effect) => effect()); return result; },
    get dirty() { return dirty; },
    stop() { slots.forEach((slot) => { if (slot.effect) { slot.cleanup?.(); slot.deps = undefined; } }); },
  };
}
const order = { bookingAttemptId: '12345678-1234-1234-1234-123456789012', name: 'Test Buyer', email: 'buyer@example.test', phone: '+50688888888', tickets: 2, total: 100, date: '2026-12-20', tourTime: '08:00', tourPackage: 'Tour', tourSlug: 'tour', tourName: 'Tour', packagePrice: 50 };
const analytics = { trackAnalyticsEvent() {}, BOOKING_COMPLETION_STORAGE_KEY: 'completed' };
const utils = { buildCheckoutKey: (value, lang) => JSON.stringify([value, lang]), buildBookingAnalyticsMetadata: () => ({}), getBuyerCountryFromPhone: () => 'CR' };
function checkout(options = {}) {
  const env = dom(), runtime = hooks(), configs = [], instances = [], routes = [];
  const sdk = { Buttons(config) {
    configs.push(config);
    const instance = { closed: 0, render: options.render ?? (() => Promise.resolve()), close() { instance.closed++; }, isEligible: () => true };
    instances.push(instance); return instance;
  } };
  const router = { push: (route) => routes.push(route) };
  const imported = load('app/components/reservation/hooks/usePayPalCheckout.ts', {
    react: runtime.react, 'next/navigation': { useRouter: () => router }, '@/lib/analytics/client': analytics,
    '@/lib/reservation/constants': { RESERVATION_TRAVELER_DRAFT_KEY: 'draft' },
    '@/app/components/reservation/checkoutUtils': utils,
    '@/lib/paypal-sdk': { loadPayPalSdk: options.loader ?? (() => Promise.resolve(sdk)) },
  }, { ...env, sessionStorage: options.storage ?? { setItem() {}, removeItem() {} },
    process: { env: { NEXT_PUBLIC_PAYPAL_MODE: 'live', NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'test-client' } },
    fetch: (...args) => options.fetch(...args),
  });
  let props = { enabled: true, orderDetails: order, lang: 'es', errorMessage: 'Payment error', onSuccess: options.onSuccess ?? (() => {}) };
  let result;
  const render = () => { result = runtime.render(() => imported.usePayPalCheckout(props)); return result; };
  const settle = async () => { for (let i = 0; i < 5; i++) { await tick(); if (runtime.dirty) render(); } return result; };
  render(); const container = new env.Element(); container.isConnected = true;
  result.paypalRef(container); render();
  return { ...env, configs, instances, routes, runtime, render, settle, get result() { return result; }, setProps(next) { props = { ...props, ...next }; render(); } };
}

test('SDK shares one pending load across mounts and validates configuration', async () => {
  const env = dom(), { loadPayPalSdk } = load('lib/paypal-sdk.ts', {}, env);
  const first = loadPayPalSdk('client');
  assert.equal(first, loadPayPalSdk('client'));
  assert.equal(env.scripts.length, 1);
  await assert.rejects(loadPayPalSdk('other'), /config_mismatch/);
  const sdk = { Buttons() {} }; env.window.paypal = sdk;
  env.scripts[0].dispatchEvent(new globalThis.Event('load'));
  assert.equal(await first, sdk);
  assert.equal(env.timers.size, 0);
});
test('SDK network errors and timeouts allow an explicit retry', async () => {
  for (const timeout of [false, true]) {
    const env = dom(), { loadPayPalSdk } = load('lib/paypal-sdk.ts', {}, env);
    const pending = loadPayPalSdk('client');
    if (timeout) [...env.timers.values()][0](); else env.scripts[0].dispatchEvent(new globalThis.Event('error'));
    await assert.rejects(pending, /load_error/);
    const retry = loadPayPalSdk('client');
    assert.equal(env.scripts.length, 1);
    env.window.paypal = { Buttons() {} }; env.scripts[0].dispatchEvent(new globalThis.Event('load'));
    await retry;
  }
});
test('checkout closes only its own instance and ignores a stale SDK completion', async () => {
  let resolveSdk;
  const app = checkout({ loader: () => new Promise((resolve) => { resolveSdk = resolve; }) });
  app.setProps({ enabled: false });
  let renders = 0;
  resolveSdk({ Buttons() { renders++; } }); await app.settle();
  assert.equal(renders, 0);
  const mounted = checkout(); await mounted.settle();
  assert.equal(mounted.instances.length, 1);
  mounted.setProps({ onSuccess: () => {}, orderDetails: { ...order } }); await mounted.settle();
  assert.equal(mounted.instances.length, 1, 'parent rerenders do not reset PayPal');
  mounted.setProps({ enabled: false }); assert.equal(mounted.instances[0].closed, 1);
  mounted.setProps({ enabled: true }); await mounted.settle(); assert.equal(mounted.instances.length, 2);
});
test('render timeout ends loading; retry succeeds and late render cannot clear the error', async () => {
  let finish;
  const app = checkout({ render: () => new Promise((resolve) => { finish = resolve; }) });
  await app.settle(); [...app.timers.values()][0](); await app.settle();
  assert.ok(app.result.paypalLoadError); assert.equal(app.result.isPaypalLoading, false);
  finish(); await app.settle(); assert.ok(app.result.paypalLoadError);
  app.result.retryPayPal(); await app.settle(); finish(); await app.settle();
  assert.equal(app.result.paypalLoadError, null);
});
test('capture retry keeps the same approved order, deduplicates callbacks, and survives blocked storage', async () => {
  const ids = []; let count = 0;
  const app = checkout({ storage: { setItem() { throw new Error('blocked'); } }, onSuccess() { throw new Error('parent failed'); },
    fetch: async (url, init) => {
      ids.push(JSON.parse(init.body).orderID);
      if (++count === 1) throw new Error('offline');
      return { ok: true, json: async () => ({ status: 'COMPLETED', captureID: 'capture' }) };
    },
  }); await app.settle();
  await app.configs[0].onApprove({ orderID: 'PAYPALORDER1234567' }); await app.settle();
  assert.equal(app.result.pendingOrderId, 'PAYPALORDER1234567'); assert.ok(app.result.paymentError);
  await assert.rejects(app.configs[0].createOrder(), /Payment error/);
  app.result.retryCapture(); app.result.retryCapture(); await app.settle();
  assert.deepEqual(ids, ['PAYPALORDER1234567', 'PAYPALORDER1234567']);
  assert.equal(app.routes[0], '/reservar/voucher?orderId=PAYPALORDER1234567');
  await app.configs[0].onApprove({ orderID: 'PAYPALORDER1234567' }); assert.equal(ids.length, 2);
});
test('declined funding restarts PayPal instead of confirming payment', async () => {
  let restarts = 0;
  const app = checkout({ fetch: async () => ({ ok: false, json: async () => ({ code: 'INSTRUMENT_DECLINED' }) }) });
  await app.settle(); await app.configs[0].onApprove({ orderID: 'PAYPALORDER1234567' }, { restart: async () => { restarts++; } }); await app.settle();
  assert.equal(restarts, 1); assert.equal(app.routes.length, 0); assert.equal(app.result.pendingOrderId, null);
});
test('draft/storage failures do not invalidate a verified quote; own capacity hold is included', async () => {
  const runtime = hooks(); const bodies = [];
  const imported = load('app/components/reservation/hooks/useCheckoutQuote.ts', { react: runtime.react }, {
    sessionStorage: { setItem() { throw new Error('blocked'); } },
    fetch: async (url, init) => {
      bodies.push(JSON.parse(init.body));
      if (url.endsWith('/draft')) throw new Error('offline');
      return { ok: true, json: async () => ({ success: true, totalWithTax: 100 }) };
    },
  });
  let result = runtime.render(() => imported.useCheckoutQuote(order, 'es')); await tick();
  result = runtime.render(() => imported.useCheckoutQuote(order, 'es'));
  assert.equal(result.synced, true); assert.equal(result.error, null);
  assert.equal(bodies[0].bookingAttemptId, order.bookingAttemptId);
});

function captureApi(responses, options = {}) {
  let quotes = 0, writes = 0; const requests = [];
  const context = { booking: { total: 100, date: order.date, tickets: 2 }, customer: {} };
  const constants = { RESERVATIONS: 'reservations', PAYPAL_ORDER_CONTEXTS: 'contexts' };
  const db = { collection: (name) => ({ findOne: async () => name === 'contexts' ? context : null, updateOne: async () => { writes++; } }) };
  const api = load('app/api/paypal/capture-order/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    '@/lib/helpers/paypal': { getPayPalAccessToken: async () => 'token', getPayPalApiBaseUrl: () => 'https://paypal.test' },
    '@/lib/helpers/mongodb': { getDb: async () => db }, '@/lib/constants/db': { COLLECTIONS: constants },
    '@/lib/reservation/quote': { quoteReservation: async () => { quotes++; if (options.quoteFails) throw new Error('unavailable'); return { totalWithTax: 100 }; }, isReservationQuoteError: () => false },
    '@/lib/reservation/capacity-holds': { releaseCapacityHold: async () => {} },
  }, { fetch: async (url, init) => { requests.push({ url, init }); const next = responses.shift(); if (!next) throw new Error('Unexpected fetch'); return { ok: next.ok ?? true, status: next.status ?? 200, json: async () => next.body }; } });
  return { api, requests, get quotes() { return quotes; }, get writes() { return writes; } };
}
const approved = { id: 'PAYPALORDER1234567', status: 'APPROVED', purchase_units: [{ amount: { value: '100.00', currency_code: 'USD' } }] };
const completed = { id: approved.id, status: 'COMPLETED', purchase_units: [{ payments: { captures: [{ id: 'CAPTURE123', status: 'COMPLETED', amount: { value: '100.00', currency_code: 'USD' } }] } }] };
const request = (body = { orderID: approved.id }) => ({ json: async () => body });
test('capture rejects malformed IDs and JSON with HTTP 400', async () => {
  for (const body of [null, {}, { orderID: 23 }, { orderID: '../bad' }]) assert.equal((await captureApi([]).api.POST(request(body))).status, 400);
  assert.equal((await captureApi([]).api.POST({ json: async () => { throw new SyntaxError(); } })).status, 400);
});
test('capture validates amount before charging and requests full idempotent capture representation', async () => {
  const good = captureApi([{ body: approved }, { body: completed }]);
  const result = await good.api.POST(request()); assert.equal(result.body.success, true); assert.equal(result.body.captureID, 'CAPTURE123');
  assert.equal(good.requests[1].init.headers.Prefer, 'return=representation');
  assert.equal(good.requests[1].init.headers['PayPal-Request-Id'], `capture-${approved.id}`);
  const bad = captureApi([{ body: { ...approved, purchase_units: [{ amount: { value: '1.00', currency_code: 'USD' } }] } }]);
  assert.equal((await bad.api.POST(request())).body.code, 'total_mismatch'); assert.equal(bad.requests.length, 1);
});
test('already captured payments reconcile without new quote or charge, including capture races', async () => {
  const recovered = captureApi([{ body: completed }], { quoteFails: true });
  assert.equal((await recovered.api.POST(request())).body.bookingSaved, true); assert.equal(recovered.quotes, 0); assert.equal(recovered.requests.length, 1);
  const raced = captureApi([{ body: approved }, { ok: false, status: 422, body: { details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] } }, { body: completed }]);
  assert.equal((await raced.api.POST(request())).body.captureID, 'CAPTURE123');
});
test('pending captures are never reported as completed and declines expose a recoverable code', async () => {
  const pending = JSON.parse(JSON.stringify(completed)); pending.purchase_units[0].payments.captures[0].status = 'PENDING';
  const result = await captureApi([{ body: approved }, { body: pending }]).api.POST(request());
  assert.equal(result.body.success, false); assert.equal(result.body.status, 'PENDING');
  const declined = await captureApi([{ body: approved }, { ok: false, status: 422, body: { details: [{ issue: 'INSTRUMENT_DECLINED' }] } }]).api.POST(request());
  assert.equal(declined.body.code, 'INSTRUMENT_DECLINED');
});

function createApi() {
  const sent = [];
  const api = load('app/api/paypal/create-order/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    'node:crypto': crypto,
    '@/lib/helpers/paypal': { getPayPalAccessToken: async () => 'token', getPayPalApiBaseUrl: () => 'https://paypal.test' },
    '@/lib/helpers/mongodb': { getDb: async () => ({ collection: () => ({ updateOne: async () => ({}) }) }) },
    '@/lib/constants/paypal': { PAYPAL_CURRENCY: 'USD', PAYPAL_CUSTOM_ID_MAX_LENGTH: 127 },
    '@/lib/constants/db': { COLLECTIONS: {} },
    '@/lib/reservation/capacity-holds': { acquireCapacityHold: async () => true, releaseCapacityHold: async () => {} },
    '@/lib/reservation/capacity': { getRemainingCapacityForTourDate: async () => 10 },
    '@/lib/helpers/costa-rica-time': { getMinBookableIsoDateInCostaRica: () => '2026-11-01', isDateOnOrAfterMinBookableInCostaRica: () => true },
    '@/lib/reservation/dates': { normalizeReservationDate: () => order.date },
    '@/lib/reservation/quote': {
      isReservationQuoteError: () => false, requiredReservationFieldsPresent: () => true,
      quoteReservation: async () => ({ safeTickets: 2, selectedPackage: { id: 'tour' }, packageLabel: 'Tour', packagePrice: 50, totalWithTax: 100, formattedTotal: '100.00', language: 'es' }),
    },
  }, { fetch: async (url, init) => { sent.push(init); return { ok: true, status: 201, json: async () => ({ id: 'PAYPALORDER1234567', links: [{ rel: 'payer-action', href: 'https://paypal.test/approve' }] }) }; } });
  return { api, sent };
}
test('create order uses stable retry IDs that change when booking data changes', async () => {
  const app = createApi();
  assert.equal((await app.api.POST(request(order))).status, 200);
  await app.api.POST(request(order)); await app.api.POST(request({ ...order, name: 'Another Buyer' }));
  assert.equal(app.sent[0].headers['PayPal-Request-Id'], app.sent[1].headers['PayPal-Request-Id']);
  assert.notEqual(app.sent[0].headers['PayPal-Request-Id'], app.sent[2].headers['PayPal-Request-Id']);
  const payer = JSON.parse(app.sent[0].body).payer;
  assert.equal(payer.phone, undefined); assert.equal(payer.address, undefined);
});
test('create order rejects malformed JSON before calling PayPal', async () => {
  const app = createApi();
  assert.equal((await app.api.POST(request(null))).status, 400);
  assert.equal((await app.api.POST({ json: async () => { throw new SyntaxError(); } })).status, 400);
  assert.equal(app.sent.length, 0);
});

test('Strict Mode cleanup during a shared pending SDK load renders only the new instance', async () => {
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  const app = checkout({ loader: () => pending });
  app.runtime.stop(); app.render();
  let renders = 0;
  resolve({ Buttons() { renders++; return { render: () => Promise.resolve(), close() {} }; } });
  await app.settle(); assert.equal(renders, 1); assert.equal(app.result.isPaypalLoading, false);
});
test('blocked analytics cannot interrupt payment rendering or completion', async () => {
  const previous = analytics.trackAnalyticsEvent;
  analytics.trackAnalyticsEvent = () => Promise.reject(new Error('storage unavailable'));
  try {
    const app = checkout({ fetch: async () => ({ ok: true, json: async () => ({ id: approved.id, status: 'COMPLETED', captureID: 'capture' }) }) });
    await app.settle(); await app.configs[0].onApprove({ orderID: approved.id }); await app.settle();
    assert.equal(app.routes.length, 1);
  } finally { analytics.trackAnalyticsEvent = previous; }
});
