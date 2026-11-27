import { defineConfig, type Plugin } from 'vite';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import catalog from '../../demos/catalog.json';

function demoPages(): Plugin {
  const stylesheet = resolve(import.meta.dirname, '../../packages/ui/src/styles/styles.css');
  return {
    name: 'demo-pages',
    configureServer(server) {
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
      for (const demo of catalog) {
        const folder = resolve(output, 'demos', demo.slug);
        mkdirSync(folder, { recursive: true });
        writeFileSync(resolve(folder, 'index.html'), html.replace(/<title>.*?<\/title>/, `<title>${demo.title} · UI Kit</title>`));
      }
    },
  };
}
export default defineConfig({ base: '/ui-kit/', publicDir: '../../demos', plugins: [demoPages()] });
