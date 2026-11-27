import type { Plugin } from 'vite';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { allDemos, libraryDemos, technologies, type Demo } from '../src/catalog/index.ts';

const root = resolve(import.meta.dirname, '../../..');
const stylesheet = resolve(root, 'packages/ui/src/styles/styles.css');
const appearance = () => readFileSync(resolve(root, 'demos/shared/appearance.js'), 'utf8');
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

function metadata(html: string, demo: Demo) {
  const value = { title: demo.title, description: demo.description, technology: technologies.find((item) => item.value === demo.implementation)?.label,
    sourceHref: demo.sourceHref, docsHref: demo.docs ? `https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/${demo.docs}` : undefined };
  const description = `<meta name="description" content="${escape(demo.description)}">`;
  html = html.replace(/<meta name="description"[^>]*>/, '');
  return html.replace('<html ', `<html data-demo="${demo.slug}" `)
    .replace(/<title>.*?<\/title>/, `<title>${escape(demo.title)} · UI Kit</title>`)
    .replace('</head>', `${description}<link rel="canonical" href="https://gbgabiola.github.io/ui-kit/demos/${demo.slug}/"><link rel="stylesheet" href="/ui-kit/shared/workspace.css"><script type="application/json" id="uik-demo-metadata">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script></head>`);
}
function nativePage(demo: Demo, canonical: boolean) {
  let html = readFileSync(resolve(root, 'demos/vanilla', demo.slug, 'index.html'), 'utf8');
  if (canonical) {
    // Preserve relative scripts, CSS assets, and dynamically assigned image URLs.
    // Hash-only links must stay on the current canonical document.
    html = html.replace(/href="(#[^"]*)"/g, `href="/ui-kit/demos/${demo.slug}/$1"`)
      .replace('<head>', `<head><base href="/ui-kit/vanilla/${demo.slug}/">`);
  }
  return metadata(html, demo);
}
export function demoPages(): Plugin {
  return {
    name: 'demo-pages',
    transformIndexHtml: {
      order: 'post',
      handler: (html, context) => {
        const slug = context.path.match(/^\/(?:ui-kit\/)?(?:demos|examples)\/([^/]+)/)?.[1];
        const demo = libraryDemos.find((item) => item.slug === slug);
        return { html: demo ? metadata(html, demo) : html, tags: [
          { tag: 'link', attrs: { rel: 'stylesheet', href: '/ui-kit/theme.css' }, injectTo: 'head-prepend' },
          { tag: 'script', children: appearance(), injectTo: 'head' },
        ] };
      },
    },
    configureServer(server) {
      const workspace = root;
      const inputs = [resolve(workspace, 'packages/ui/src/index.ts'), resolve(workspace, 'demos/catalog.json'), stylesheet];
      const folders = [resolve(workspace, 'apps/demo/src/examples') + sep, resolve(workspace, 'apps/storybook/stories') + sep];
      let timer: ReturnType<typeof setTimeout>;
      const synchronize = (file: string) => {
        if (file === stylesheet) { server.ws.send({ type: 'full-reload' }); return; }
        if (!inputs.includes(file) && !folders.some((folder) => file.startsWith(folder) && file.endsWith('.tsx'))) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          try { execFileSync(process.execPath, [resolve(workspace, 'scripts/demos/sync-demos.mjs')], { cwd: workspace, stdio: 'pipe' }); }
          catch (error) { server.config.logger.error(String(error)); }
        }, 150);
      };
      server.watcher.add([...inputs, ...folders.map((folder) => folder.slice(0, -1))]);
      for (const event of ['add', 'change', 'unlink'] as const) server.watcher.on(event, synchronize);
      server.httpServer?.once('close', () => {
        clearTimeout(timer);
        for (const event of ['add', 'change', 'unlink'] as const) server.watcher.off(event, synchronize);
      });
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] || '';
        const match = path.match(/^\/ui-kit\/(demos|vanilla)\/([^/]+)\/?$/);
        const native = allDemos.find((demo) => demo.kind === 'vanilla' && demo.slug === match?.[2]);
        if (native) {
          if (!path.endsWith('/')) { res.writeHead(302, { Location: `${path}/${req.url?.includes('?') ? '?' + req.url.split('?')[1] : ''}` }); res.end(); return; }
          res.setHeader('Content-Type', 'text/html');
          res.end(nativePage(native, match![1] === 'demos')); return;
        }
        if (req.url?.split('?')[0] === '/ui-kit/theme.css') {
          res.setHeader('Content-Type', 'text/css');
          res.end(readFileSync(stylesheet));
        } else next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'theme.css', source: readFileSync(stylesheet, 'utf8') });
    },
    writeBundle(options) {
      const output = resolve(options.dir!);
      const html = readFileSync(resolve(output, 'index.html'), 'utf8');
      const write = (folder: string, page: string) => {
        mkdirSync(resolve(output, folder), { recursive: true });
        writeFileSync(resolve(output, folder, 'index.html'), page);
      };
      for (const demo of allDemos) {
        write(`demos/${demo.slug}`, demo.kind === 'vanilla' ? nativePage(demo, true) : metadata(html, demo));
        if (demo.kind === 'vanilla') write(`vanilla/${demo.slug}`, nativePage(demo, false));
      }
      for (const demo of libraryDemos) write(`examples/${demo.slug}`, metadata(html, demo));
    },
  };
}
