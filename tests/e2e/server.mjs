// 极简静态服务器：只为 E2E 提供仓库根目录的文件，无任何动态逻辑
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const PORT = Number(process.env.PORT || 8123);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    if (path === '' || path === '.') path = 'index.html';
    const file = join(ROOT, path);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[e2e] serving ${ROOT} at http://127.0.0.1:${PORT}`);
});
