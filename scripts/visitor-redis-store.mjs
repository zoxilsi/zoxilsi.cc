import { createHash } from 'node:crypto';

const maximum = Number.MAX_SAFE_INTEGER;
const defaultPrefix = 'zoxilsi:portfolio:visitors';

// EVAL keeps reads, deduplication, and increments together across serverless
// instances. Validate everything before writes: Lua errors do not roll back.
const counterScript = `
local operation = ARGV[1]
local visitor_hash = ARGV[2]
local maximum_string = '9007199254740991'
local maximum_number = 9007199254740991

local function invalid(message)
  return redis.error_reply('VISITOR_COUNTER ' .. message)
end

local function key_type(key)
  local reply = redis.call('TYPE', key)
  if type(reply) == 'table' then return reply.ok end
  return reply
end

if operation ~= 'read' and operation ~= 'record' then
  return invalid('invalid operation')
end
if operation == 'record' and (not visitor_hash or #visitor_hash ~= 64 or not string.match(visitor_hash, '^[0-9a-f]+$')) then
  return invalid('invalid visitor hash')
end

local unique_type = key_type(KEYS[1])
local visits_type = key_type(KEYS[2])
if (unique_type ~= 'none' and unique_type ~= 'set') or (visits_type ~= 'none' and visits_type ~= 'string') then
  return invalid('invalid stored key type; existing data was not reset')
end

local raw_visits = redis.call('GET', KEYS[2])
local visits = 0
if raw_visits then
  if raw_visits ~= '0' and not string.match(raw_visits, '^[1-9][0-9]*$') then
    return invalid('invalid stored count; existing data was not reset')
  end
  if #raw_visits > #maximum_string or (#raw_visits == #maximum_string and raw_visits > maximum_string) then
    return invalid('stored count exceeds maximum safe integer; existing data was not reset')
  end
  visits = tonumber(raw_visits)
end

local unique = redis.call('SCARD', KEYS[1])
if unique < 0 or unique > maximum_number or unique > visits or (visits > 0 and unique == 0) then
  return invalid('inconsistent stored counts; existing data was not reset')
end
if operation == 'read' then return { unique, visits } end
if visits >= maximum_number then return invalid('maximum safe integer reached') end

local added = redis.pcall('SADD', KEYS[1], visitor_hash)
if type(added) == 'table' and added.err then return added end
local incremented = redis.pcall('INCR', KEYS[2])
if type(incremented) == 'table' and incremented.err then
  if added == 1 then redis.pcall('SREM', KEYS[1], visitor_hash) end
  return incremented
end
return { unique + added, incremented }
`;

function configuration(env) {
  if (!env || typeof env !== 'object') throw new TypeError('Redis visitor counter configuration is required.');
  const useUpstash = env.UPSTASH_REDIS_REST_URL !== undefined || env.UPSTASH_REDIS_REST_TOKEN !== undefined;
  const rawUrl = useUpstash ? env.UPSTASH_REDIS_REST_URL : env.KV_REST_API_URL;
  const rawToken = useUpstash ? env.UPSTASH_REDIS_REST_TOKEN : env.KV_REST_API_TOKEN;
  if (typeof rawUrl !== 'string' || !rawUrl.trim() || typeof rawToken !== 'string' || !rawToken.trim()) {
    throw new TypeError('A complete Upstash Redis REST URL/token pair is required.');
  }

  let url;
  try { url = new URL(rawUrl.trim()); } catch { throw new TypeError('Redis REST URL must be a valid HTTPS endpoint.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new TypeError('Redis REST URL must be HTTPS without embedded credentials, query, or fragment.');
  }
  const token = rawToken.trim();
  if (/[\r\n]/u.test(token)) throw new TypeError('Redis REST token contains invalid characters.');

  const prefix = env.KEY_PREFIX === undefined ? defaultPrefix : env.KEY_PREFIX;
  if (typeof prefix !== 'string' || !/^[a-zA-Z0-9:._-]{1,160}$/u.test(prefix)) {
    throw new TypeError('Visitor counter KEY_PREFIX must use 1–160 letters, numbers, colons, dots, underscores, or hyphens.');
  }
  const mode = env.VISITOR_COUNT_MODE || 'unique';
  if (!['unique', 'visits'].includes(mode)) throw new TypeError('Visitor counter mode must be "unique" or "visits".');

  return {
    url: url.href,
    token,
    mode,
    // Shared hash tags also keep both keys in one slot on Redis Cluster.
    keys: [`{${prefix}}:unique`, `{${prefix}}:visits`],
  };
}

/** A shared visitor counter over Upstash's Redis REST API; no local fallback. */
export function createRedisVisitorStore({ env = process.env, fetchImpl = globalThis.fetch, timeoutMs = 4500 } = {}) {
  const { url, token, mode, keys } = configuration(env);
  if (typeof fetchImpl !== 'function') throw new TypeError('A Fetch implementation is required.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) {
    throw new TypeError('Redis request timeout must be between 1 and 5000 milliseconds.');
  }

  async function execute(operation, visitorHash = '') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(['EVAL', counterScript, 2, ...keys, operation, visitorHash]),
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Redis request failed.');
      const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
      if (contentType !== 'application/json' && !contentType?.endsWith('+json')) throw new Error('Redis response is not JSON.');
      const body = await response.json();
      if (!body || typeof body !== 'object' || Array.isArray(body) || 'error' in body || !Array.isArray(body.result) || body.result.length !== 2) {
        throw new Error('Redis response has an invalid shape.');
      }
      const [unique, visits] = body.result;
      if (![unique, visits].every(value => Number.isSafeInteger(value) && value >= 0 && value <= maximum) || unique > visits || (visits > 0 && unique === 0)) {
        throw new Error('Redis response contains invalid counts.');
      }
      return { count: mode === 'unique' ? unique : visits, mode };
    } catch {
      // No retries: a timed-out write may already have committed remotely.
      throw new Error('Shared visitor counter is temporarily unavailable.');
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    read: () => execute('read'),
    async record(visitorId) {
      if (typeof visitorId !== 'string' || visitorId.length !== 32 || !/^[a-f0-9]{32}$/u.test(visitorId)) {
        throw new TypeError('Visitor ID must contain exactly 32 lowercase hexadecimal characters.');
      }
      const hash = createHash('sha256').update(visitorId).digest('hex');
      return execute('record', hash);
    },
  };
}
