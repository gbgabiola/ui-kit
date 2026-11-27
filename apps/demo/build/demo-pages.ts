import type { Plugin } from 'vite';
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { allDemos, technologies, type Demo } from '../src/catalog/index.ts';

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
function nativePage(demo: Demo) {
  return metadata(readFileSync(resolve(root, 'demos/native', demo.slug, 'index.html'), 'utf8'), demo);
}
const contentTypes: Record<string, string> = {
  '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
function publicFiles() {
  const files = new Map<string, string>();
  const collect = (directory: string, prefix: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      const name = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) collect(path, name);
      else if (entry.isFile() && contentTypes[extname(entry.name)]) files.set(name, path);
    }
  };
  collect(resolve(root, 'demos/shared'), 'shared');
  collect(resolve(root, 'demos/previews'), 'previews');
  for (const demo of allDemos.filter((item) => item.kind === 'native')) {
    collect(resolve(root, 'demos/native', demo.slug), `demos/${demo.slug}`);
  }
  files.set('demos/LICENSE', resolve(root, 'demos/native/LICENSE'));
  files.set('LICENSE', resolve(root, 'LICENSE'));
  return files;
}
export function demoPages(): Plugin {
  return {
    name: 'demo-pages',
    transformIndexHtml: {
      order: 'post',
      handler: (html, context) => {
        const slug = context.path.match(/^\/(?:ui-kit\/)?demos\/([^/]+)/)?.[1];
        const demo = allDemos.find((item) => item.slug === slug);
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
      const files = publicFiles();
      server.middlewares.use(async (req, res, next) => {
        let path: string;
        try { path = decodeURIComponent((req.url || '').split('?')[0]); }
        catch { res.writeHead(400); res.end('Invalid URL'); return; }
        if (!path.startsWith('/ui-kit/')) return next();
        const relative = path.slice('/ui-kit/'.length);
        const match = relative.match(/^demos\/([^/]+)\/$/);
        const demo = allDemos.find((item) => item.slug === match?.[1]);
        if (demo) {
          try {
            const html = demo.kind === 'native' ? nativePage(demo)
              : await server.transformIndexHtml(path, readFileSync(resolve(root, 'apps/demo/index.html'), 'utf8'));
            res.setHeader('Content-Type', 'text/html'); res.end(html);
          } catch (error) { next(error); }
          return;
        }
        const file = relative === 'theme.css' ? stylesheet : files.get(relative);
        if (file) {
          try {
            const content = readFileSync(file);
            res.setHeader('Content-Type', contentTypes[extname(file)] || 'text/plain');
            res.end(content);
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') { res.writeHead(404); res.end('Not found'); }
            else next(error);
          }
          return;
        }
        // Demo namespaces are explicit; missing paths must never fall back to the gallery.
        if (/^(?:demos|vanilla|examples|native)(?:\/|$)/.test(relative)) {
          res.writeHead(404); res.end('Not found'); return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'theme.css', source: readFileSync(stylesheet, 'utf8') });
      for (const [fileName, path] of publicFiles()) this.emitFile({ type: 'asset', fileName, source: readFileSync(path) });
    },
    writeBundle(options) {
      const output = resolve(options.dir!);
      const html = readFileSync(resolve(output, 'index.html'), 'utf8');
      for (const demo of allDemos) {
        const folder = resolve(output, 'demos', demo.slug);
        mkdirSync(folder, { recursive: true });
        writeFileSync(resolve(folder, 'index.html'), demo.kind === 'native' ? nativePage(demo) : metadata(html, demo));
      }
    },
  };
}
