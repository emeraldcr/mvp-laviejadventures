import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(file, imports = {}, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    if (name in imports) return imports[name];
    if (name.startsWith('node:') || name === 'mongodb') return require(name);
    throw new Error(`Unexpected import: ${name}`);
  }, Buffer: globalThis.Buffer, URL: globalThis.URL, TextDecoder: globalThis.TextDecoder, Date, console: globalThis.console, process: { env: {} }, ...globals });
  return module.exports;
}
const validation = load('lib/security/validation.ts');
const next = { NextResponse: { json: (body, init) => globalThis.Response.json(body, init), next: () => new globalThis.Response(null) } };

test('reset tokens reject Mongo operators and malformed values; bcrypt limits count UTF-8 bytes', () => {
  for (const value of [{ $ne: null }, [], null, 123, 'a'.repeat(63), 'z'.repeat(64)]) assert.equal(validation.validResetToken(value), false);
  assert.equal(validation.validResetToken('a'.repeat(64)), true);
  assert.equal(validation.validPassword('a'.repeat(72)), true);
  assert.equal(validation.validPassword('é'.repeat(37)), false);
  assert.equal(validation.validEmail({ $regex: '.*' }), false);
});

test('JSON rejects nested operators and excessive depth; names are escaped in HTML', () => {
  assert.equal(validation.safeJson({ tourSlug: { $ne: null } }), false);
  let body = {}; for (let i = 0; i < 20; i++) body = { nested: body };
  assert.equal(validation.safeJson(body), false);
  assert.equal(validation.safeJson({ name: 'Traveller', tickets: 2, addonIds: ['lunch'] }), true);
  assert.equal(validation.escapeHtml('<a href="evil">&'), '&lt;a href=&quot;evil&quot;&gt;&amp;');
});

function usersFixture() {
  const records = new Map(); const calls = [];
  const collection = {
    createIndex: async () => 'email_1',
    findOne: async query => { calls.push(query); return records.get(query.resetTokenHash ?? query.email ?? query.auth0Sub) ?? null; },
    updateOne: async (query, update) => {
      calls.push({ query, update });
      if (query.resetTokenHash) {
        if (!records.has(query.resetTokenHash)) return { modifiedCount: 0 };
        records.delete(query.resetTokenHash); return { modifiedCount: 1 };
      }
      return { modifiedCount: 1 };
    },
  };
  const api = load('lib/auth/users/user.ts', {
    '@/lib/data/mongodb': { getDb: async () => ({ collection: () => collection }) },
    '@/lib/data/collections': { COLLECTIONS: { USERS: 'users' } },
    '@/lib/auth/user-preferences': { DEFAULT_USER_PREFERENCES: { notifications: {} } },
    '@/lib/security/validation': validation,
  });
  return { api, calls, records };
}

test('reset lookup cannot inject a selector and issued tokens are hashed at rest', async () => {
  const { api, calls } = usersFixture();
  assert.equal(await api.findUserByResetToken({ $ne: null }), null);
  assert.equal(calls.length, 0);
  await api.setUserResetToken('0123456789abcdef01234567', 'a'.repeat(64), new Date());
  const update = calls[0].update;
  assert.equal(update.$set.resetToken, undefined);
  assert.notEqual(update.$set.resetTokenHash, 'a'.repeat(64));
  assert.equal(update.$set.resetTokenHash.length, 64);
  assert.equal(update.$unset.resetToken, '');
});

test('only one concurrent password reset succeeds and revokes sessions', async () => {
  const { api, records, calls } = usersFixture();
  const token = 'b'.repeat(64);
  records.set(require('node:crypto').createHash('sha256').update(token).digest('hex'), {});
  const results = await Promise.all([api.consumeUserResetToken(token, 'hash'), api.consumeUserResetToken(token, 'hash')]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.equal(calls[0].update.$inc.sessionVersion, 1);
  assert.equal(calls[0].update.$set.emailVerified, true);
  assert.ok(calls[0].query.resetExpiry.$gt instanceof Date);
});

test('Auth0 requires verified email and never silently links an existing password identity', async () => {
  const { api, records, calls } = usersFixture();
  assert.equal(await api.upsertUserFromAuth0({ auth0Sub: 'auth0|1', email: 'a@example.com', emailVerified: false }), null);
  assert.equal(calls.length, 0);
  records.set('a@example.com', { passwordHash: 'existing' });
  assert.equal(await api.upsertUserFromAuth0({ auth0Sub: 'auth0|1', email: 'a@example.com', emailVerified: true }), null);
  assert.equal(calls.some(call => call.update), false);
});

function proxyFixture(allow = async () => true) {
  return load('proxy.ts', {
    'next/server': next,
    '@/lib/security/rate-limit': { allowRequest: allow },
    '@/lib/security/validation': validation,
  }).proxy;
}
function request(body, headers = {}, path = '/api/auth/reset-password') {
  const req = new globalThis.Request(`https://example.com${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  req.nextUrl = new globalThis.URL(req.url); return req;
}

test('API rejects foreign origins, wrong content type, malformed JSON and query operators', async () => {
  const proxy = proxyFixture();
  assert.equal((await proxy(request({}, { origin: 'https://evil.com' }))).status, 403);
  assert.equal((await proxy(request({}, { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await proxy(request('{'))).status, 400);
  assert.equal((await proxy(request({ token: { $ne: null } }))).status, 400);
  assert.equal((await proxy(request({ token: 'a'.repeat(64) }, { origin: 'https://example.com' }))).status, 200);
});

test('API limits actual body bytes without trusting Content-Length', async () => {
  const response = await proxyFixture()(request({ name: 'a'.repeat(33 * 1024) }));
  assert.equal(response.status, 413);
});

test('rate limits fail closed and send retry hints', async () => {
  const blocked = await proxyFixture(async () => false)(request({}));
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('retry-after'), '60');
  assert.equal((await proxyFixture(async () => { throw Error('db unavailable'); })(request({}))).status, 503);
});

test('payment ownership binds signed HttpOnly cookie to an order and rejects tampering', async () => {
  const jar = new Map(); let options;
  const api = load('lib/security/payment-owner.ts', {
    'next/headers': { cookies: async () => ({ set: (name, value, opts) => { jar.set(name, value); options = opts; }, get: name => jar.has(name) ? { value: jar.get(name) } : undefined }) },
  }, { process: { env: { AUTH_SECRET: 'test-secret-not-a-production-secret', NODE_ENV: 'production' } } });
  assert.equal(await api.ownsPayment('ORDER123456'), false);
  await api.setPaymentOwner('ORDER123456');
  assert.equal(await api.ownsPayment('ORDER123456'), true);
  assert.equal(options.httpOnly, true); assert.equal(options.secure, true);
  jar.set('lva-paypal-OTHER123456', jar.get('lva-paypal-ORDER123456'));
  assert.equal(await api.ownsPayment('OTHER123456'), false);
  jar.set('lva-paypal-ORDER123456', '0'.repeat(13) + '.' + 'a'.repeat(64));
  assert.equal(await api.ownsPayment('ORDER123456'), false);
});

test('analytics GET denies anonymous and ordinary users before querying the database', async () => {
  const api = load('app/api/analytics/events/route.ts', {
    'next/server': next,
    '@/lib/auth': { auth: async () => ({ user: { email: 'attacker@example.com', verifiedEmail: true } }) },
    '@/lib/data/mongodb': { getDb: async () => { throw Error('must not access database'); } },
    'next/headers': {}, '@/lib/data/collections': { COLLECTIONS: {} },
  }, { process: { env: { ANALYTICS_ADMIN_EMAILS: 'owner@example.com' } } });
  assert.equal((await api.GET(new globalThis.Request('https://example.com/api/analytics/events'))).status, 403);
});

test('unverified accounts can query reservations only by their own authenticated user ID', async () => {
  let query;
  const api = load('app/api/bookings/route.ts', {
    'next/server': next,
    '@/lib/auth': { auth: async () => ({ user: { id: 'attacker-id', email: 'victim@example.com', verifiedEmail: false } }) },
    '@/lib/data/collections': { COLLECTIONS: {} },
    '@/lib/data/mongodb': { getDb: async () => ({ collection: () => ({ find: value => { query = value; return { sort: () => ({ limit: () => ({ toArray: async () => [] }) }) }; } }) }) },
  });
  assert.equal((await api.GET()).status, 200);
  assert.equal(JSON.stringify(query), JSON.stringify({ userId: 'attacker-id' }));
});

test('expired draft capabilities cannot be resurrected or chosen by a client', async () => {
  let stored;
  const api = load('lib/booking/checkout/drafts.ts', { '@/lib/data/collections': { COLLECTIONS: {} } });
  const db = { collection: () => ({ findOne: async () => null, updateOne: async (query, update) => { stored = { query, update }; } }) };
  const oldToken = 'a'.repeat(43);
  const saved = await api.saveReservationDraft(db, { bookingAttemptId: 'attempt' }, oldToken);
  assert.notEqual(saved.resumeToken, oldToken);
  assert.equal(stored.query.tokenHash.length, 64);
  assert.equal(stored.update.$set.orderDetails.resumeToken, undefined);
});

test('server booking queries never include email for unverified users or match null identities', () => {
  const api = load('app/(page_routes)/booking/lib/booking-data.ts', { '../constants': { RESERVATIONS_COLLECTION: 'reservations' } });
  assert.equal(JSON.stringify(api.bookingQueryForUser('attacker', 'victim@example.com')), '{"$or":[{"userId":"attacker"}]}');
  assert.equal(JSON.stringify(api.bookingQueryForUser(null, null)), '{"_id":{"$exists":false}}');
  assert.equal(api.bookingQueryForUser('owner', 'owner@example.com', true).$or.length, 3);
});

function voucherFixture({ browserOwner = false, user = null, emailDeliveryStatus = 'sent' } = {}) {
  let reads = 0, mails = 0, claimed = false, sent = emailDeliveryStatus === 'sent';
  const record = { _id: 'reservation', orderId: 'PAYPALORDER1234567', captureId: 'CAPTURE', status: 'COMPLETED', userId: 'owner', email: 'owner@example.com', amount: 100, currency: 'USD' };
  const collection = {
    findOne: async () => { reads++; return { ...record, emailDeliveryStatus: sent ? 'sent' : emailDeliveryStatus }; },
    findOneAndUpdate: async () => { if (claimed || sent) return null; claimed = true; return record; },
    updateOne: async (query, update) => { sent = update.$set.emailDeliveryStatus === 'sent'; return {}; },
  };
  const api = load('app/(page_routes)/success/bookingService.tsx', {
    '@/lib/auth': { auth: async () => user ? { user } : null },
    '@/lib/security/payment-owner': { ownsPayment: async () => browserOwner },
    '@/lib/security/rate-limit': { allowRequest: async () => true },
    '@/lib/data/mongodb': { getDb: async () => ({ collection: () => collection }) },
    '@/lib/data/collections': { COLLECTIONS: {} },
    './emailService': { sendConfirmationEmail: async () => { mails++; return { status: 'sent' }; } },
  });
  return { api, get reads() { return reads; }, get mails() { return mails; } };
}

test('vouchers deny anonymous ID bearers and unrelated/unverified accounts', async () => {
  const anon = voucherFixture();
  assert.ok((await anon.api.processSuccessfulBooking('PAYPALORDER1234567')).error);
  assert.equal(anon.reads, 0);
  for (const user of [{ id: 'attacker', email: 'owner@example.com' }, { id: 'attacker', email: 'attacker@example.com', verifiedEmail: true }]) {
    const fixture = voucherFixture({ user });
    const result = await fixture.api.processSuccessfulBooking('PAYPALORDER1234567');
    assert.ok(result.error); assert.equal(result.email, undefined); assert.equal(fixture.mails, 0);
  }
});

test('voucher owners can read persisted payments; concurrent reloads send only one email', async () => {
  const fixture = voucherFixture({ browserOwner: true, emailDeliveryStatus: undefined });
  // Explicit non-sent status exercises the atomic claim.
  const concurrent = voucherFixture({ browserOwner: true, emailDeliveryStatus: 'not_requested' });
  const results = await Promise.all([concurrent.api.processSuccessfulBooking('PAYPALORDER1234567'), concurrent.api.processSuccessfulBooking('PAYPALORDER1234567')]);
  assert.ok(results.every(result => result.error === null));
  assert.equal(concurrent.mails, 1);
  await concurrent.api.processSuccessfulBooking('PAYPALORDER1234567');
  assert.equal(concurrent.mails, 1);
  assert.equal((await fixture.api.processSuccessfulBooking('PAYPALORDER1234567')).emailStatus, 'sent');
  const account = voucherFixture({ user: { id: 'owner' } });
  assert.equal((await account.api.processSuccessfulBooking('PAYPALORDER1234567')).error, null);
});

test('JWT sessions reject deleted identities and versions revoked by a password reset', async () => {
  let config; let currentUser = { _id: { toString: () => 'owner' }, sessionVersion: 2, emailVerified: true };
  load('lib/auth/auth.ts', {
    'next-auth': { default: value => { config = value; return {}; } },
    'next-auth/providers/auth0': { default: value => value },
    'next-auth/providers/credentials': { default: value => value },
    bcryptjs: { default: {} },
    '@/lib/auth/users/user': { findUserByEmail: async () => currentUser },
    '@/lib/auth/auth0-config': { getAuth0Issuer: () => undefined },
    '@/lib/email/login-email': {}, '@/lib/auth/audit/login-log': {},
    '@/lib/security/validation': validation, '@/lib/security/rate-limit': {},
  });
  const token = { email: 'owner@example.com', sub: 'owner', sessionVersion: 1 };
  assert.equal(await config.callbacks.jwt({ token }), null);
  assert.equal((await config.callbacks.jwt({ token: { ...token, sessionVersion: 2 } })).emailVerified, true);
  currentUser = null;
  assert.equal(await config.callbacks.jwt({ token }), null);
  assert.equal(await config.callbacks.signIn({ account: { provider: 'auth0' }, profile: { email: 'owner@example.com', email_verified: false } }), false);
});
