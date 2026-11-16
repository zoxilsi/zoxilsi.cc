import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createRedisVisitorStore } from './visitor-redis-store.mjs';

// No Redis server is installed in the test environment. The mock models the
// atomic REST command's contract; these tests do not execute or certify Lua.
const baseEnv = {
  UPSTASH_REDIS_REST_URL: 'https://counter.example.test',
  UPSTASH_REDIS_REST_TOKEN: 'test-server-only-token',
};
const id = number => number.toString(16).padStart(32, '0');
const hash = visitorId => createHash('sha256').update(visitorId).digest('hex');
const response = body => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

function atomicRestMock() {
  const namespaces = new Map();
  const calls = [];
  const fetchImpl = async (url, options) => {
    const command = JSON.parse(options.body);
    calls.push({ url, options, command });
    assert.equal(command[0], 'EVAL');
    assert.equal(typeof command[1], 'string');
    assert.equal(command[2], 2);
    const [uniqueKey, visitsKey, operation, visitorHash] = command.slice(3);
    assert.equal(uniqueKey.match(/\{([^{}]+)\}/u)[1], visitsKey.match(/\{([^{}]+)\}/u)[1]);
    assert.ok(['read', 'record'].includes(operation));
    // Yield so multiple independent store instances issue overlapping requests.
    await new Promise(resolve => setImmediate(resolve));
    let state = namespaces.get(uniqueKey);
    if (!state) state = { hashes: new Set(), visits: 0 };
    if (operation === 'record') {
      assert.match(visitorHash, /^[a-f0-9]{64}$/u);
      if (state.visits === Number.MAX_SAFE_INTEGER) return response({ error: 'VISITOR_COUNTER maximum safe integer reached' });
      state.hashes.add(visitorHash);
      state.visits += 1;
      namespaces.set(uniqueKey, state);
    } else assert.equal(visitorHash, '');
    return response({ result: [state.hashes.size, state.visits] });
  };
  return { fetchImpl, calls, namespaces };
}

test('REST contract uses one authenticated EVAL, colocated keys, and only a visitor hash', async () => {
  const upstream = atomicRestMock();
  const store = createRedisVisitorStore({ env: baseEnv, fetchImpl: upstream.fetchImpl });
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
  assert.equal(upstream.calls.length, 1);
  const { url, options, command } = upstream.calls[0];
  assert.equal(url, 'https://counter.example.test/');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers.Authorization, 'Bearer test-server-only-token');
  assert.equal(options.headers['Content-Type'], 'application/json');
  assert.equal(options.headers.Accept, 'application/json');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.redirect, 'error');
  assert.deepEqual(command.slice(3, 5), ['{zoxilsi:portfolio:visitors}:unique', '{zoxilsi:portfolio:visitors}:visits']);
  assert.equal(command[5], 'record');
  assert.equal(command[6], hash(id(1)));
  assert.equal(options.body.includes(id(1)), false);
  assert.equal(options.body.includes(baseEnv.UPSTASH_REDIS_REST_TOKEN), false);
  assert.equal(upstream.namespaces.values().next().value.hashes.has(hash(id(1))), true);
});

test('simulated atomic REST deduplicates unique browsers and preserves visit totals across modes', async () => {
  const upstream = atomicRestMock();
  const unique = createRedisVisitorStore({ env: baseEnv, fetchImpl: upstream.fetchImpl });
  const visits = createRedisVisitorStore({ env: { ...baseEnv, VISITOR_COUNT_MODE: 'visits' }, fetchImpl: upstream.fetchImpl });
  assert.deepEqual(await unique.read(), { count: 0, mode: 'unique' });
  assert.equal(upstream.namespaces.size, 0, 'a read does not create a namespace or record a hit');
  assert.deepEqual(await unique.record(id(1)), { count: 1, mode: 'unique' });
  assert.deepEqual(await unique.record(id(1)), { count: 1, mode: 'unique' });
  assert.deepEqual(await visits.record(id(2)), { count: 3, mode: 'visits' });
  assert.deepEqual(await unique.read(), { count: 2, mode: 'unique' });
  assert.deepEqual(await visits.read(), { count: 3, mode: 'visits' });
});

test('overlapping clients each issue a single EVAL and retain the simulated provider totals', async () => {
  const upstream = atomicRestMock();
  const clients = Array.from({ length: 3 }, () => createRedisVisitorStore({ env: { ...baseEnv, VISITOR_COUNT_MODE: 'visits' }, fetchImpl: upstream.fetchImpl }));
  const results = await Promise.all(Array.from({ length: 75 }, (_, index) => clients[index % 3].record(id(index % 25))));
  assert.equal(upstream.calls.length, 75);
  assert.deepEqual(results.map(value => value.count).sort((a, b) => a - b), Array.from({ length: 75 }, (_, index) => index + 1));
  assert.deepEqual(await clients[0].read(), { count: 75, mode: 'visits' });
  const unique = createRedisVisitorStore({ env: baseEnv, fetchImpl: upstream.fetchImpl });
  assert.deepEqual(await unique.read(), { count: 25, mode: 'unique' });
});

test('KV aliases and a custom prefix use the same server-only REST contract', async () => {
  const upstream = atomicRestMock();
  const env = { KV_REST_API_URL: 'https://kv.example.test/', KV_REST_API_TOKEN: 'kv-test-token', KEY_PREFIX: 'custom:portfolio-v3' };
  const store = createRedisVisitorStore({ env, fetchImpl: upstream.fetchImpl });
  await store.record(id(3));
  assert.equal(upstream.calls[0].url, env.KV_REST_API_URL);
  assert.equal(upstream.calls[0].options.headers.Authorization, 'Bearer kv-test-token');
  assert.deepEqual(upstream.calls[0].command.slice(3, 5), ['{custom:portfolio-v3}:unique', '{custom:portfolio-v3}:visits']);
});

test('bad configuration is refused instead of selecting a fake or reset counter', () => {
  const invalid = [
    {},
    { UPSTASH_REDIS_REST_URL: baseEnv.UPSTASH_REDIS_REST_URL },
    { ...baseEnv, UPSTASH_REDIS_REST_URL: 'http://counter.example.test' },
    { ...baseEnv, UPSTASH_REDIS_REST_URL: 'not a url' },
    { ...baseEnv, UPSTASH_REDIS_REST_URL: 'https://user:password@counter.example.test' },
    { ...baseEnv, UPSTASH_REDIS_REST_URL: 'https://counter.example.test/?token=secret' },
    { ...baseEnv, UPSTASH_REDIS_REST_URL: 'https://counter.example.test/#fragment' },
    { ...baseEnv, UPSTASH_REDIS_REST_TOKEN: '' },
    { ...baseEnv, UPSTASH_REDIS_REST_TOKEN: 'token\nInjected-Header: no' },
    { ...baseEnv, KEY_PREFIX: '' },
    { ...baseEnv, KEY_PREFIX: '{wrong-slot}' },
    { ...baseEnv, KEY_PREFIX: 'x'.repeat(161) },
    { ...baseEnv, VISITOR_COUNT_MODE: 'people' },
    { UPSTASH_REDIS_REST_URL: baseEnv.UPSTASH_REDIS_REST_URL, KV_REST_API_TOKEN: 'must-not-mix-pairs' },
  ];
  for (const env of invalid) assert.throws(() => createRedisVisitorStore({ env }), TypeError);
  for (const timeoutMs of [0, -1, 1.5, 5001]) {
    assert.throws(() => createRedisVisitorStore({ env: baseEnv, timeoutMs }), /between 1 and 5000/u);
  }
  assert.throws(() => createRedisVisitorStore({ env: baseEnv, fetchImpl: null }), /Fetch implementation/u);
});

test('invalid visitor IDs never reach Redis and do not break later requests', async () => {
  const upstream = atomicRestMock();
  const store = createRedisVisitorStore({ env: baseEnv, fetchImpl: upstream.fetchImpl });
  for (const value of [undefined, null, 1, '', 'visitor', 'a'.repeat(31), 'A'.repeat(32), 'g'.repeat(32), `${id(1)}\n`]) {
    await assert.rejects(store.record(value), /exactly 32 lowercase hexadecimal/u);
  }
  assert.equal(upstream.calls.length, 0);
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
});

test('invalid upstream responses and stored-data errors fail without retries or reset commands', async () => {
  const invalidResponses = [
    () => new Response('failed', { status: 500 }),
    () => new Response('unauthorized', { status: 401 }),
    () => new Response('<html>Not JSON</html>', { headers: { 'Content-Type': 'text/html' } }),
    () => new Response('{', { headers: { 'Content-Type': 'application/json' } }),
    () => response({ error: 'VISITOR_COUNTER invalid stored type; secret-provider-details' }),
    () => response(null),
    () => response({ result: null }),
    () => response({ result: [1] }),
    () => response({ result: [1, 1, 1] }),
    () => response({ result: [-1, 1] }),
    () => response({ result: [1, 1.5] }),
    () => response({ result: [1, '2'] }),
    () => response({ result: [2, 1] }),
    () => response({ result: [0, 1] }),
    () => response({ result: [1, Number.MAX_SAFE_INTEGER + 1] }),
  ];
  for (const invalidResponse of invalidResponses) {
    const calls = [];
    const store = createRedisVisitorStore({ env: baseEnv, fetchImpl: async (url, options) => { calls.push(JSON.parse(options.body)); return invalidResponse(); } });
    await assert.rejects(store.record(id(1)), { message: 'Shared visitor counter is temporarily unavailable.' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'EVAL');
    assert.equal(calls[0][5], 'record');
  }
});

test('an upstream connection failure stays an error, never a fallback zero', async () => {
  const store = createRedisVisitorStore({ env: baseEnv, fetchImpl: async () => { throw new Error('private upstream failure'); } });
  await assert.rejects(store.read(), { message: 'Shared visitor counter is temporarily unavailable.' });
});

test('upstream timeout aborts one request without retrying a potentially committed write', async () => {
  let calls = 0;
  let signal;
  const store = createRedisVisitorStore({
    env: baseEnv,
    timeoutMs: 15,
    fetchImpl: async (url, options) => {
      calls += 1;
      signal = options.signal;
      return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
    },
  });
  await assert.rejects(store.record(id(1)), /temporarily unavailable/u);
  assert.equal(calls, 1);
  assert.equal(signal.aborted, true);
});

test('maximum valid totals remain readable while overflow is surfaced without replacing data', async () => {
  const upstream = atomicRestMock();
  const store = createRedisVisitorStore({ env: { ...baseEnv, VISITOR_COUNT_MODE: 'visits' }, fetchImpl: upstream.fetchImpl });
  upstream.namespaces.set('{zoxilsi:portfolio:visitors}:unique', { hashes: new Set([hash(id(1))]), visits: Number.MAX_SAFE_INTEGER });
  assert.deepEqual(await store.read(), { count: Number.MAX_SAFE_INTEGER, mode: 'visits' });
  await assert.rejects(store.record(id(2)), /temporarily unavailable/u);
  assert.equal(upstream.namespaces.values().next().value.visits, Number.MAX_SAFE_INTEGER);
  assert.equal(upstream.namespaces.values().next().value.hashes.size, 1);
  assert.equal(upstream.calls.length, 2);
});
