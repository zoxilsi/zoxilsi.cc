import { randomBytes } from 'node:crypto';
import { createRedisVisitorStore } from '../scripts/visitor-redis-store.mjs';

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Cookie',
    ...headers,
  });
  response.end(JSON.stringify(body));
}

function sameOrigin(request) {
  if (request.headers?.['sec-fetch-site'] === 'cross-site') return false;
  const origin = request.headers?.origin;
  if (origin === undefined) return true;
  if (typeof origin !== 'string' || typeof request.headers?.host !== 'string') return false;
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}

/** Factory injection is for tests; production always uses the configured Redis. */
export function createVisitorHandler(options = {}) {
  return async function visitors(request, response) {
    if (!['GET', 'POST'].includes(request.method)) {
      request.resume?.();
      json(response, 405, { error: 'Method not allowed' }, { Allow: 'GET, POST' });
      return;
    }
    if (request.method === 'POST' && !sameOrigin(request)) {
      request.resume?.();
      json(response, 403, { error: 'Cross-site visits are not accepted' });
      return;
    }

    try {
      const store = createRedisVisitorStore(options);
      if (request.method === 'GET') {
        json(response, 200, await store.read());
        return;
      }

      request.resume?.();
      const cookieHeader = request.headers?.cookie;
      const candidate = typeof cookieHeader === 'string'
        ? cookieHeader.split(';').map(value => value.trim()).find(value => value.startsWith('zoxilsi_visitor='))?.slice('zoxilsi_visitor='.length)
        : undefined;
      const visitorId = typeof candidate === 'string' && candidate.length === 32 && /^[a-f0-9]{32}$/u.test(candidate)
        ? candidate
        : randomBytes(16).toString('hex');
      const result = await store.record(visitorId);
      const forwardedProto = request.headers?.['x-forwarded-proto'];
      const secure = request.socket?.encrypted || (typeof forwardedProto === 'string' && forwardedProto.split(',')[0].trim() === 'https');
      json(response, 200, result, {
        'Set-Cookie': `zoxilsi_visitor=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
      });
    } catch {
      // Keep credentials, upstream details, and visitor identifiers out of logs.
      json(response, 503, { error: 'Visitor count temporarily unavailable' });
    }
  };
}

export default createVisitorHandler();
