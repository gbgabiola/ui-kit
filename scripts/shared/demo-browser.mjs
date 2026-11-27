import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
export const root = resolve(import.meta.dirname, '../..');
const require = createRequire(new URL('../../apps/storybook/package.json', import.meta.url));
export const { chromium } = require('@playwright/test');
export const fixture = [{ name: 'Satsuki', age: '11', gender: 'Female', eye_color: 'Brown', hair_color: 'Brown' }];
export async function serve(directory) {
  const folder = resolve(root, directory);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.gif': 'image/gif', '.mp3': 'audio/mpeg' };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/ui-kit\//, '/');
      let file = resolve(folder, `.${pathname}`);
      if (file !== folder && !file.startsWith(folder + sep)) throw new Error('Invalid path');
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }); response.end(body);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((done) => server.close(done)) };
}
export async function prepare(context, theme) {
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'ghibliapi.vercel.app') return route.fulfill({ json: fixture });
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
    return route.continue();
  });
  await context.addInitScript(({ theme }) => {
    Math.random = () => .25;
    localStorage.setItem('uik-demo-appearance', JSON.stringify({ theme, palette: 'teal' }));
  }, { theme });
}
export async function settled(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });
}
