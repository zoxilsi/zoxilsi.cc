import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

const schemaVersion = 1;
const visitorIdPattern = /^[a-f0-9]{32}$/;
const visitorHashPattern = /^[a-f0-9]{64}$/;

function emptyState() {
  return { schemaVersion, count: 0, visitorHashes: [] };
}

function validateState(state, filePath) {
  const keys = state && typeof state === 'object' && !Array.isArray(state)
    ? Object.keys(state).sort()
    : [];
  const valid = keys.join(',') === 'count,schemaVersion,visitorHashes'
    && state.schemaVersion === schemaVersion
    && Number.isSafeInteger(state.count)
    && state.count >= 0
    && Array.isArray(state.visitorHashes)
    && state.visitorHashes.every(hash => typeof hash === 'string' && visitorHashPattern.test(hash))
    && new Set(state.visitorHashes).size === state.visitorHashes.length
    && state.visitorHashes.length <= state.count;

  if (!valid) {
    throw new Error(`Visitor counter data at ${filePath} has an invalid or unsupported schema; the existing counter was not reset.`);
  }
  return state;
}

/**
 * A serialized, file-backed visitor counter for a single Node.js process.
 * The stored count tracks every record; unique mode returns the hash count.
 * Reopening the same file with another mode preserves both measurements.
 */
export function createVisitorStore({ filePath, mode = 'unique' } = {}) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new TypeError('A nonempty visitor counter filePath is required.');
  }
  if (!['unique', 'visits'].includes(mode)) {
    throw new TypeError('Visitor counter mode must be "unique" or "visits".');
  }

  let queue = Promise.resolve();

  function serialize(operation) {
    const result = queue.then(operation);
    // A failed operation reaches its caller without poisoning later work.
    queue = result.catch(() => {});
    return result;
  }

  async function load() {
    let source;
    try {
      source = await readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return emptyState();
      throw error;
    }

    let state;
    try {
      state = JSON.parse(source);
    } catch (cause) {
      throw new Error(`Visitor counter data at ${filePath} is not valid JSON; the existing counter was not reset.`, { cause });
    }
    return validateState(state, filePath);
  }

  async function save(state) {
    const directory = dirname(filePath);
    await mkdir(directory, { recursive: true });
    const temporary = join(directory, `.${basename(filePath)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, `${JSON.stringify(state)}\n`, { flag: 'wx', mode: 0o600 });
      await rename(temporary, filePath);
    } catch (error) {
      await unlink(temporary).catch(() => {});
      throw error;
    }
  }

  const snapshot = state => ({
    count: mode === 'unique' ? state.visitorHashes.length : state.count,
    mode,
  });

  return {
    read() {
      return serialize(async () => snapshot(await load()));
    },

    async record(visitorId) {
      if (typeof visitorId !== 'string' || !visitorIdPattern.test(visitorId)) {
        throw new TypeError('Visitor ID must contain exactly 32 lowercase hexadecimal characters.');
      }
      return serialize(async () => {
        const state = await load();
        if (state.count === Number.MAX_SAFE_INTEGER) {
          throw new RangeError('Visitor counter cannot exceed the maximum safe integer.');
        }
        const hash = createHash('sha256').update(visitorId).digest('hex');
        if (!state.visitorHashes.includes(hash)) state.visitorHashes.push(hash);
        state.count += 1;
        await save(state);
        return snapshot(state);
      });
    },
  };
}
