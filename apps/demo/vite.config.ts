import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { demoPages } from './build/demo-pages.ts';

export default defineConfig({
  base: '/ui-kit/',
  publicDir: '../../demos',
  plugins: [demoPages()],
  resolve: { alias: [
    { find: /^@gbgabiola\/ui$/, replacement: resolve(import.meta.dirname, '../../packages/ui/src/index.ts') },
    { find: /^@gbgabiola\/ui\/styles\.css$/, replacement: resolve(import.meta.dirname, '../../packages/ui/src/styles/styles.css') },
  ] },
});
