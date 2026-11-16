import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createVisitorStore } from './visitor-store.mjs';

const root = fileURLToPath(new URL(process.argv.includes('--dist') ? '../dist/' : '../', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex > -1 ? process.argv[portIndex + 1] : process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const visitorStore = createVisitorStore({
  filePath: process.env.VISITOR_DATA_FILE
    ? resolve(process.env.VISITOR_DATA_FILE)
    : fileURLToPath(new URL('../.data/visitors.json', import.meta.url)),
  mode: process.env.VISITOR_COUNT_MODE || 'unique',
});
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
const pages = new Map([
  ['/', 'index.html'],
  ['/work', 'work.html'],
  ['/about', 'about.html'],
  ['/contact', 'contact.html'],
]);
const pageAliases = new Map([
  ['/index.html', '/'],
  ...['work', 'about', 'contact'].flatMap(page => [
    [`/${page}.html`, `/${page}`],
    [`/${page}/`, `/${page}`],
  ]),
]);

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

async function visitors(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
    request.resume();
    json(response, 405, { error: 'Method not allowed' }, { Allow: 'GET, POST' });
    return;
  }

  if (request.method === 'POST') {
    let sameOrigin = request.headers['sec-fetch-site'] !== 'cross-site';
    if (request.headers.origin) {
      try { sameOrigin &&= new URL(request.headers.origin).host === request.headers.host; }
      catch { sameOrigin = false; }
    }
    if (!sameOrigin) {
      request.resume();
      json(response, 403, { error: 'Cross-site visits are not accepted' });
      return;
    }
  }

  try {
    if (request.method === 'GET') {
      json(response, 200, await visitorStore.read());
      return;
    }

    request.resume();
    const cookie = request.headers.cookie?.split(';').map(value => value.trim())
      .find(value => value.startsWith('zoxilsi_visitor='))?.slice('zoxilsi_visitor='.length);
    const visitorId = /^[a-f0-9]{32}$/.test(cookie || '') ? cookie : randomBytes(16).toString('hex');
    const result = await visitorStore.record(visitorId);
    const secure = request.socket.encrypted || request.headers['x-forwarded-proto']?.split(',')[0].trim() === 'https';
    json(response, 200, result, {
      'Set-Cookie': `zoxilsi_visitor=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`,
    });
  } catch (error) {
    console.error('Visitor counter unavailable:', error.message);
    json(response, 503, { error: 'Visitor count temporarily unavailable' });
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/api/visitors') {
      await visitors(request, response);
      return;
    }
    if (pageAliases.has(pathname)) {
      response.writeHead(308, { Location: `${pageAliases.get(pathname)}${url.search}` }).end();
      return;
    }
    const file = resolve(root, pages.get(pathname) || `.${pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const blocked = pathname.split('/').some(part => part.startsWith('.') || ['scripts', 'node_modules'].includes(part));
    if (blocked || !(await stat(file)).isFile()) throw new Error('Not found');
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is busy. Try npm run dev -- --port ${port + 1}` : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`\n  zoxilsi — http://localhost:${port}\n  ${process.argv.includes('--dist') ? 'Serving production build' : 'Local development · refresh to see changes'}\n`));
