#!/usr/bin/env node
/**
 * Same-origin preview: static Expo web export + /api/* -> ASP.NET on :5080.
 * Usage: node tools/preview-server.mjs [port]
 * Env: PORT (default 4310), API_ORIGIN (default http://127.0.0.1:5080), DIST_DIR
 */
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(process.env.DIST_DIR || path.join(ROOT, 'dist'));
const PORT = Number(process.env.PORT || process.argv[2] || 4310);
const API_ORIGIN = process.env.API_ORIGIN || 'http://127.0.0.1:5080';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split('?')[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function sendFile(res, filePath) {
  const stream = fs.createReadStream(filePath);
  res.writeHead(200, {
    'Content-Type': contentType(filePath),
    'Cache-Control': filePath.endsWith('.html')
      ? 'no-cache'
      : 'public, max-age=31536000, immutable',
  });
  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.end('file error');
  });
}

function tryStatic(reqPath) {
  let filePath = safeJoin(DIST, reqPath === '/' ? '/index.html' : reqPath);
  if (!filePath) return null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }
  // Expo static export clean URLs: /login -> login.html
  if (!path.extname(reqPath)) {
    const htmlSibling = safeJoin(DIST, `${reqPath}.html`);
    if (htmlSibling && fs.existsSync(htmlSibling)) return htmlSibling;
    const nested = safeJoin(DIST, path.join(reqPath, 'index.html'));
    if (nested && fs.existsSync(nested)) return nested;
  }
  return null;
}

function spaFallback() {
  const candidates = [
    path.join(DIST, 'index.html'),
    path.join(DIST, '+not-found.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function proxyApi(req, res) {
  const target = new URL(req.url, API_ORIGIN);
  const lib = target.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: target.host };
  delete headers['accept-encoding'];

  const proxyReq = lib.request(
    target,
    { method: req.method, headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        message: 'API proxy unavailable',
        detail: String(err.message || err),
      }),
    );
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (url.startsWith('/api/') || url === '/api' || url.startsWith('/health')) {
    // /health is on API root; optional convenience
    if (url.startsWith('/health')) {
      req.url = '/health';
    }
    return proxyApi(req, res);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end('Method Not Allowed');
  }

  const found = tryStatic(url.split('?')[0]);
  if (found) return sendFile(res, found);

  const fallback = spaFallback();
  if (fallback) return sendFile(res, fallback);

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[preview] http://0.0.0.0:${PORT}  dist=${DIST}  api=${API_ORIGIN}`,
  );
});
