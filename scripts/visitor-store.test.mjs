import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createVisitorStore } from './visitor-store.mjs';

const id = number => number.toString(16).padStart(32, '0');
const hash = visitorId => createHash('sha256').update(visitorId).digest('hex');

async function fixture(t, mode = 'unique') {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-visitor-store-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filePath = join(directory, 'counter.json');
  return { directory, filePath, store: createVisitorStore({ filePath, mode }) };
}

test('unique mode deduplicates visitors and persists only hashes', async t => {
  const { filePath, store } = await fixture(t);
  assert.deepEqual(await store.read(), { count: 0, mode: 'unique' });
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
  assert.deepEqual(await store.record(id(2)), { count: 2, mode: 'unique' });

  const source = await readFile(filePath, 'utf8');
  assert.deepEqual(JSON.parse(source), {
    schemaVersion: 1,
    count: 3,
    visitorHashes: [hash(id(1)), hash(id(2))],
  });
  assert.equal(source.includes(id(1)), false);
  assert.equal(source.includes(id(2)), false);
});

test('visits mode increments every record and can reopen in either mode', async t => {
  const { filePath, store } = await fixture(t, 'visits');
  await store.record(id(1));
  assert.deepEqual(await store.record(id(1)), { count: 2, mode: 'visits' });
  await store.record(id(2));
  assert.deepEqual(await createVisitorStore({ filePath, mode: 'visits' }).read(), { count: 3, mode: 'visits' });
  const uniqueStore = createVisitorStore({ filePath });
  assert.deepEqual(await uniqueStore.read(), { count: 2, mode: 'unique' });
  assert.deepEqual(await uniqueStore.record(id(3)), { count: 3, mode: 'unique' });
  assert.deepEqual(await store.read(), { count: 4, mode: 'visits' });
});

test('50 concurrent records retain every increment and all distinct visitors', async t => {
  const { directory, filePath, store } = await fixture(t, 'visits');
  const operations = Array.from({ length: 50 }, (_, index) => store.record(id(index % 25)));
  const queuedRead = store.read();
  const results = await Promise.all(operations);
  assert.deepEqual(results.map(result => result.count), Array.from({ length: 50 }, (_, index) => index + 1));
  assert.deepEqual(await queuedRead, { count: 50, mode: 'visits' });
  assert.deepEqual(await createVisitorStore({ filePath }).read(), { count: 25, mode: 'unique' });
  assert.deepEqual(await readdir(directory), ['counter.json']);
});

test('record creates missing parent directories', async t => {
  const { directory } = await fixture(t);
  const filePath = join(directory, 'nested', 'data', 'counter.json');
  const store = createVisitorStore({ filePath });
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
  assert.deepEqual(await createVisitorStore({ filePath }).read(), { count: 1, mode: 'unique' });
});

test('malformed JSON is refused without replacing the existing file', async t => {
  const { filePath, store } = await fixture(t);
  const corrupt = '{"schemaVersion":1,"count":12,';
  await writeFile(filePath, corrupt);
  await assert.rejects(store.read(), /not valid JSON.*not reset/);
  await assert.rejects(store.record(id(1)), /not valid JSON.*not reset/);
  assert.equal(await readFile(filePath, 'utf8'), corrupt);
});

test('unexpected schema and impossible counts are refused without resets', async t => {
  const { filePath, store } = await fixture(t);
  const invalidStates = [
    { schemaVersion: 2, count: 0, visitorHashes: [] },
    { schemaVersion: 1, count: -1, visitorHashes: [] },
    { schemaVersion: 1, count: 1.5, visitorHashes: [] },
    { schemaVersion: 1, count: Number.MAX_SAFE_INTEGER + 1, visitorHashes: [] },
    { schemaVersion: 1, count: 1, visitorHashes: [id(1)] },
    { schemaVersion: 1, count: 2, visitorHashes: [hash(id(1)), hash(id(1))] },
    { schemaVersion: 1, count: 0, visitorHashes: [hash(id(1))] },
    { schemaVersion: 1, count: 0, visitorHashes: [], visitorId: id(1) },
    null,
  ];
  for (const state of invalidStates) {
    const source = JSON.stringify(state);
    await writeFile(filePath, source);
    await assert.rejects(store.record(id(2)), /invalid or unsupported schema.*not reset/);
    assert.equal(await readFile(filePath, 'utf8'), source);
  }
});

test('a rejected operation does not poison subsequent queued work', async t => {
  const { filePath, store } = await fixture(t);
  await writeFile(filePath, 'broken');
  const first = store.read();
  const second = store.record(id(1));
  await assert.rejects(first, /not valid JSON/);
  await assert.rejects(second, /not valid JSON/);

  await writeFile(filePath, JSON.stringify({ schemaVersion: 1, count: 0, visitorHashes: [] }));
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
  assert.deepEqual(await store.read(), { count: 1, mode: 'unique' });
});

test('invalid visitor IDs do not create a counter or affect later records', async t => {
  const { directory, store } = await fixture(t);
  for (const value of [undefined, null, 1, '', 'visitor', 'a'.repeat(31), 'A'.repeat(32), 'g'.repeat(32), `${id(1)}\n`]) {
    await assert.rejects(store.record(value), /32 lowercase hexadecimal/);
  }
  assert.deepEqual(await readdir(directory), []);
  assert.deepEqual(await store.record(id(1)), { count: 1, mode: 'unique' });
});

test('counter overflow preserves the existing data', async t => {
  const { filePath, store } = await fixture(t, 'visits');
  const source = JSON.stringify({ schemaVersion: 1, count: Number.MAX_SAFE_INTEGER, visitorHashes: [] });
  await writeFile(filePath, source);
  await assert.rejects(store.record(id(1)), /maximum safe integer/);
  assert.equal(await readFile(filePath, 'utf8'), source);
});
