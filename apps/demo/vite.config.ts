import { defineConfig, type Plugin } from 'vite';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { allDemos, libraryDemos } from './src/catalog';

function demoPages(): Plugin {
  const stylesheet = resolve(import.meta.dirname, '../../packages/ui/src/styles/styles.css');
  return {
    name: 'demo-pages',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        { tag: 'link', attrs: { rel: 'stylesheet', href: '/ui-kit/theme.css' }, injectTo: 'head-prepend' },
        { tag: 'script', children: readFileSync(resolve(import.meta.dirname, '../../demos/appearance.js'), 'utf8'), injectTo: 'head' },
      ],
    },
    configureServer(server) {
      const workspace = resolve(import.meta.dirname, '../..');
      const inputs = [resolve(workspace, 'packages/ui/src/index.ts'), resolve(workspace, 'demos/catalog.json'), stylesheet];
      const folders = [resolve(workspace, 'apps/demo/src/examples') + sep, resolve(workspace, 'apps/storybook/stories') + sep];
      let timer: ReturnType<typeof setTimeout>;
      const synchronize = (file: string) => {
        if (file === stylesheet) { server.ws.send({ type: 'full-reload' }); return; }
        if (!inputs.includes(file) && !folders.some((folder) => file.startsWith(folder) && file.endsWith('.tsx'))) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          try { execFileSync(process.execPath, [resolve(workspace, 'scripts/sync-demos.mjs')], { cwd: workspace, stdio: 'pipe' }); }
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
      for (const demo of allDemos) {
        const folder = resolve(output, 'demos', demo.slug);
        mkdirSync(folder, { recursive: true });
        writeFileSync(resolve(folder, 'index.html'), html.replace(/<title>.*?<\/title>/, `<title>${demo.title} · UI Kit</title>`));
      }
      for (const demo of libraryDemos) {
        const folder = resolve(output, 'examples', demo.slug);
        mkdirSync(folder, { recursive: true });
        writeFileSync(resolve(folder, 'index.html'), html.replace(/<title>.*?<\/title>/, `<title>${demo.title} preview · UI Kit</title>`));
      }
    },
  };
}
export default defineConfig({
  base: '/ui-kit/', publicDir: '../../demos', plugins: [demoPages()],
  resolve: { alias: [
    { find: /^@gbgabiola\/ui$/, replacement: resolve(import.meta.dirname, '../../packages/ui/src/index.ts') },
    { find: /^@gbgabiola\/ui\/styles\.css$/, replacement: resolve(import.meta.dirname, '../../packages/ui/src/styles/styles.css') },
  ] },
});
