import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { componentCatalog } from '../components/component-catalog.mjs';
import { syncDemos } from '../demos/sync-demos.mjs';
const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'apps/demo/dist');
const entry = await readFile(resolve(output, 'index.html'), 'utf8');
assert.ok(entry.indexOf('<meta charset') >= 0 && entry.indexOf('<meta charset') < 1024);
assert.ok(entry.includes('window.UIKitAppearance') && entry.indexOf('window.UIKitAppearance') < entry.indexOf('</head>'));

const demos = JSON.parse(await readFile(resolve(root, 'demos/catalog.json')));
const components = JSON.parse(await readFile(resolve(root, 'demos/components.json')));
const exports = await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8');
const stories = JSON.parse(await readFile(resolve(root, 'apps/storybook/storybook-static/index.json')));
await syncDemos({ root, check: true });
assert.deepEqual(components, await componentCatalog(root));
assert.equal(new Set([...demos, ...components].map((item) => item.slug)).size, demos.length + components.length);
for (const items of [demos, components]) {
  assert.equal(new Set(items.map((item) => item.slug)).size, items.length);
  for (const item of items) {
    assert.match(item.slug, /^[a-z0-9-]+$/);
    assert.ok(item.title && item.description && item.category);
    for (const theme of ['light', 'dark']) {
      assert.equal(item.previews[theme], `previews/${items === demos ? 'demos' : 'components'}/${item.slug}-${theme}.png`);
      for (const folder of [resolve(root, 'demos'), output]) {
        const file = resolve(folder, item.previews[theme]);
        assert.ok((await stat(file)).size > 1000, `Missing preview ${file}`);
        assert.equal((await readFile(file)).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      }
    }
    const html = await readFile(resolve(output, 'demos', item.slug, 'index.html'), 'utf8');
    assert.ok(html.includes(`<title>${item.title} · UI Kit</title>`));
    const data = JSON.parse(html.match(/id="uik-demo-metadata">(.*?)<\/script>/s)[1]);
    assert.equal(data.title, item.title); assert.equal(data.description, item.description);
    if (items === demos) {
      assert.ok(['html-css', 'html-css-js'].includes(item.implementation));
      const source = await readFile(resolve(root, 'demos/native', item.slug, 'index.html'), 'utf8');
      assert.ok(source.includes('../../shared/appearance.js') && source.includes('../../theme.css'));
      assert.ok(!html.includes('<base'), 'Native assets must use their canonical directory');
      assert.ok(!html.includes('/assets/index-'), 'Native demos must not load the React gallery');
      assert.equal(data.sourceHref, `https://github.com/gbgabiola/ui-kit/tree/main/demos/native/${item.slug}`);
    } else {
      assert.ok((await stat(resolve(root, item.source))).isFile());
      assert.match(exports, new RegExp(`\\b${item.title}\\b`));
      assert.ok(stories.entries[item.story] && stories.entries[item.docs], `Missing Storybook target for ${item.title}`);
    }
  }
}
for (const asset of ['shared/appearance.js', 'theme.css', 'shared/demo.css', 'shared/workspace.css']) assert.ok((await stat(resolve(output, asset))).size > 0);
// Publish only canonical demo documents and their runtime assets.
assert.deepEqual((await readdir(output)).sort(), [
  'LICENSE', 'shared', 'assets', 'demos',
  'index.html', 'previews', 'theme.css',
].sort());
assert.deepEqual((await readdir(resolve(output, 'demos'))).sort(), ['LICENSE', ...demos.map((item) => item.slug), ...components.map((item) => item.slug)].sort());
async function inspect(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = resolve(folder, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else {
      assert.ok(!entry.name.endsWith('.md') && !['screenshot.png', 'preview.gif'].includes(entry.name), `Documentation asset leaked: ${file}`);
      if (/\.(?:html|js|css|json)$/.test(entry.name)) {
        const text = await readFile(file, 'utf8');
        assert.ok(!/\/ui-kit\/(?:vanilla|examples|native)\//.test(text), `Removed route leaked: ${file}`);
        assert.ok(!/http-equiv=["']refresh["']/i.test(text), `Redirect page leaked: ${file}`);
      }
    }
  }
}
await inspect(output);
console.log(`Verified ${demos.length + components.length} canonical demo pages, ${components.length} React examples, ${(demos.length + components.length) * 2} previews, source links, licenses, and published assets.`);
