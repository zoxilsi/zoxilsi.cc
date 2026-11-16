import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createVisitorHandler } from '../api/visitors.js';

// These tests exercise the real handler/store boundary against mocked REST
// responses. They do not claim an integration with a live Redis database.
const configuration = {
  UPSTASH_REDIS_REST_URL: 'https://counter.example.invalid',
  UPSTASH_REDIS_REST_TOKEN: 'test-only-secret-token',
};
const visitorId = '0123456789abcdef0123456789abcdef';
const visitorHash = createHash('sha256').update(visitorId).digest('hex');

function mockedUpstream(payload = { result: [3, 8] }, { status = 200, contentType = 'application/json' } = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': contentType } });
  };
  return { calls, fetchImpl };
}

async function invoke(handler, { method = 'GET', headers = {}, encrypted = false, body } = {}) {
  const request = {
    method,
    headers: { host: 'www.zoxilsi.cc', ...headers },
    socket: { encrypted },
    body,
    resumes: 0,
    resume() { this.resumes += 1; },
  };
  const response = {
    statusCode: undefined,
    headers: {},
    body: undefined,
    writeHead(status, suppliedHeaders) {
      this.statusCode = status;
      this.headers = Object.fromEntries(Object.entries(suppliedHeaders).map(([name, value]) => [name.toLowerCase(), value]));
    },
    end(source) { this.body = JSON.parse(source); },
  };
  await handler(request, response);
  return { request, response };
}

function assertJsonHeaders(response) {
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers.vary, 'Cookie');
}

test('GET reads without recording a hit or setting a cookie', async () => {
  const upstream = mockedUpstream();
  const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
  const { response } = await invoke(handler, { encrypted: true, headers: { cookie: `zoxilsi_visitor=${visitorId}` } });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { count: 3, mode: 'unique' });
  assertJsonHeaders(response);
  assert.equal(response.headers['set-cookie'], undefined);
  assert.equal(upstream.calls.length, 1);
  const command = JSON.parse(upstream.calls[0].options.body);
  assert.equal(command[0], 'EVAL');
  assert.equal(command[2], 2);
  assert.equal(command[5], 'read');
  assert.equal(command[6], '');
});

test('POST renews a valid anonymous cookie and forwards only its SHA-256 hash', async () => {
  const upstream = mockedUpstream();
  const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
  const { request, response } = await invoke(handler, {
    method: 'POST',
    headers: {
      origin: 'https://www.zoxilsi.cc',
      cookie: `unrelated=private; zoxilsi_visitor=${visitorId}; session=private-session`,
      'sec-fetch-site': 'same-origin',
      'x-forwarded-proto': 'https, http',
      'x-forwarded-for': '192.0.2.42',
      'x-real-ip': '192.0.2.42',
      'user-agent': 'test-private-browser',
      'x-contact-email': 'private@example.invalid',
    },
    body: 'private-request-body',
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { count: 3, mode: 'unique' });
  assertJsonHeaders(response);
  assert.equal(request.resumes, 1);
  assert.equal(response.headers['set-cookie'], `zoxilsi_visitor=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`);
  assert.equal(upstream.calls.length, 1);
  const call = upstream.calls[0];
  const command = JSON.parse(call.options.body);
  assert.equal(command[5], 'record');
  assert.equal(command[6], visitorHash);
  assert.equal(command.length, 7);
  assert.deepEqual(call.options.headers, {
    Authorization: `Bearer ${configuration.UPSTASH_REDIS_REST_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  for (const privateValue of [visitorId, 'private-session', '192.0.2.42', 'test-private-browser', 'private@example.invalid', 'private-request-body']) {
    assert.equal(call.options.body.includes(privateValue), false);
    assert.equal(JSON.stringify(call.options.headers).includes(privateValue), false);
  }
});

test('invalid or absent cookies get fresh 32-hex identifiers, never the supplied value', async () => {
  for (const cookie of [undefined, 'zoxilsi_visitor=invalid', `zoxilsi_visitor=${'a'.repeat(31)}`, `zoxilsi_visitor=${'A'.repeat(32)}`, `zoxilsi_visitor=${'a'.repeat(33)}`]) {
    const upstream = mockedUpstream({ result: [1, 1] });
    const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
    const { response } = await invoke(handler, { method: 'POST', headers: { cookie }, encrypted: true });
    assert.equal(response.statusCode, 200);
    const generated = /^zoxilsi_visitor=([a-f0-9]{32});/u.exec(response.headers['set-cookie'])?.[1];
    assert.match(generated, /^[a-f0-9]{32}$/u);
    const command = JSON.parse(upstream.calls[0].options.body);
    assert.equal(command[6], createHash('sha256').update(generated).digest('hex'));
    assert.equal(upstream.calls[0].options.body.includes(generated), false);
  }
});

test('Secure is set for direct TLS or HTTPS forwarding, and omitted for local HTTP', async () => {
  for (const [encrypted, forwardedProto, expectedSecure] of [
    [true, undefined, true],
    [false, 'https', true],
    [false, 'https, http', true],
    [false, 'http', false],
    [false, undefined, false],
  ]) {
    const upstream = mockedUpstream({ result: [1, 1] });
    const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
    const { response } = await invoke(handler, { method: 'POST', encrypted, headers: { 'x-forwarded-proto': forwardedProto } });
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['set-cookie'].endsWith('; Secure'), expectedSecure);
    assert.ok(response.headers['set-cookie'].includes('; HttpOnly; SameSite=Lax'));
    assert.ok(response.headers['set-cookie'].includes('; Max-Age=31536000;'));
  }
});

test('unsupported methods return 405 before checking configuration or contacting Redis', async () => {
  const upstream = mockedUpstream();
  const handler = createVisitorHandler({ env: {}, fetchImpl: upstream.fetchImpl });
  for (const method of ['PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']) {
    const { request, response } = await invoke(handler, { method });
    assert.equal(response.statusCode, 405);
    assert.deepEqual(response.body, { error: 'Method not allowed' });
    assert.equal(response.headers.allow, 'GET, POST');
    assert.equal(response.headers['set-cookie'], undefined);
    assert.equal(request.resumes, 1);
    assertJsonHeaders(response);
  }
  assert.equal(upstream.calls.length, 0);
});

test('cross-site or malformed-origin POST requests are rejected before any upstream request', async () => {
  const upstream = mockedUpstream();
  const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
  const rejectedHeaders = [
    { 'sec-fetch-site': 'cross-site' },
    { 'sec-fetch-site': 'cross-site', origin: 'https://www.zoxilsi.cc' },
    { origin: 'https://unrelated.example' },
    { origin: 'https://www.zoxilsi.cc:444' },
    { origin: 'not a valid origin' },
    { origin: 'null' },
    { origin: ['https://www.zoxilsi.cc'] },
    { origin: 'https://www.zoxilsi.cc', host: undefined },
  ];
  for (const headers of rejectedHeaders) {
    const { request, response } = await invoke(handler, { method: 'POST', headers });
    assert.equal(response.statusCode, 403);
    assert.deepEqual(response.body, { error: 'Cross-site visits are not accepted' });
    assert.equal(response.headers['set-cookie'], undefined);
    assert.equal(request.resumes, 1);
    assertJsonHeaders(response);
  }
  assert.equal(upstream.calls.length, 0);
});

test('read-only GET remains available across origins without creating a visitor', async () => {
  const upstream = mockedUpstream({ result: [0, 0] });
  const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
  const { response } = await invoke(handler, { headers: { origin: 'https://unrelated.example', 'sec-fetch-site': 'cross-site' } });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { count: 0, mode: 'unique' });
  assert.equal(response.headers['set-cookie'], undefined);
  assert.equal(JSON.parse(upstream.calls[0].options.body)[5], 'read');
});

test('unique and visits modes expose their actual stored measurement and mode', async () => {
  for (const [mode, expected] of [['unique', 3], ['visits', 8]]) {
    for (const method of ['GET', 'POST']) {
      const upstream = mockedUpstream({ result: [3, 8] });
      const handler = createVisitorHandler({ env: { ...configuration, VISITOR_COUNT_MODE: mode }, fetchImpl: upstream.fetchImpl });
      const { response } = await invoke(handler, { method, headers: { cookie: `zoxilsi_visitor=${visitorId}` } });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, { count: expected, mode });
    }
  }
});

test('missing Redis configuration returns 503 without a pretend count or cookie', async () => {
  const upstream = mockedUpstream({ result: [0, 0] });
  const handler = createVisitorHandler({ env: {}, fetchImpl: upstream.fetchImpl });
  for (const method of ['GET', 'POST']) {
    const { response } = await invoke(handler, { method });
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { error: 'Visitor count temporarily unavailable' });
    assert.equal('count' in response.body, false);
    assert.equal(response.headers['set-cookie'], undefined);
    assertJsonHeaders(response);
  }
  assert.equal(upstream.calls.length, 0);
});

test('upstream failures and invalid counts produce generic 503 responses without details', async () => {
  const failures = [
    mockedUpstream({ error: 'UPSTREAM_SECRET_DETAIL' }),
    mockedUpstream({ result: [3, 8] }, { status: 401 }),
    mockedUpstream({ result: [3, 8] }, { contentType: 'text/html' }),
    mockedUpstream({ result: [4, 3] }),
    mockedUpstream({ result: [0, 1] }),
    mockedUpstream({ result: [1, Number.MAX_SAFE_INTEGER + 1] }),
    mockedUpstream({ result: ['3', 8] }),
    mockedUpstream({ result: [1.5, 8] }),
    { fetchImpl: async () => { throw new Error(`UPSTREAM_SECRET_DETAIL ${configuration.UPSTASH_REDIS_REST_TOKEN}`); } },
  ];
  for (const upstream of failures) {
    const handler = createVisitorHandler({ env: configuration, fetchImpl: upstream.fetchImpl });
    const { response } = await invoke(handler, { method: 'POST', headers: { cookie: `zoxilsi_visitor=${visitorId}` } });
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { error: 'Visitor count temporarily unavailable' });
    assert.equal(JSON.stringify(response).includes('UPSTREAM_SECRET_DETAIL'), false);
    assert.equal(JSON.stringify(response).includes(configuration.UPSTASH_REDIS_REST_TOKEN), false);
    assert.equal(response.headers['set-cookie'], undefined);
    assertJsonHeaders(response);
  }
});

test('an aborted upstream request returns an unavailable response without retrying', async () => {
  let calls = 0;
  let aborted = false;
  const fetchImpl = (url, { signal }) => {
    calls += 1;
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => { aborted = true; reject(new Error('Timed out')); }, { once: true });
    });
  };
  const handler = createVisitorHandler({ env: configuration, fetchImpl, timeoutMs: 10 });
  const { response } = await invoke(handler, { method: 'POST' });
  assert.equal(aborted, true);
  assert.equal(calls, 1);
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { error: 'Visitor count temporarily unavailable' });
  assert.equal(response.headers['set-cookie'], undefined);
});
