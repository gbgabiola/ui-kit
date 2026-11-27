import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'apps/demo/dist');
const demos = JSON.parse(await readFile(resolve(root, 'demos/catalog.json')));
const components = JSON.parse(await readFile(resolve(root, 'demos/components.json')));
const exports = await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8');
const stories = JSON.parse(await readFile(resolve(root, 'apps/storybook/storybook-static/index.json')));
assert.equal(demos.length, 17);
assert.equal(components.length, 14);
assert.equal(new Set([...demos, ...components].map((item) => item.slug)).size, 31);
assert.equal(demos.filter((item) => item.implementation === 'html-css').length, 8);
assert.equal(demos.filter((item) => item.implementation === 'html-css-js').length, 9);
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
    if (items === demos) {
      assert.ok(['html-css', 'html-css-js'].includes(item.implementation));
      const source = await readFile(resolve(root, 'demos/vanilla', item.slug, 'index.html'), 'utf8');
      assert.ok(source.includes(`https://github.com/gbgabiola/ui-kit/tree/main/demos/vanilla/${item.slug}`));
      assert.ok(source.includes('../../appearance.js') && source.includes('../../theme.css'));
      const html = await readFile(resolve(output, 'demos', item.slug, 'index.html'), 'utf8');
      assert.ok(html.includes(`<title>${item.title} · UI Kit</title>`));
      assert.ok((await stat(resolve(output, 'vanilla', item.slug, 'index.html'))).isFile());
    } else {
      assert.ok((await stat(resolve(root, item.source))).isFile());
      const html = await readFile(resolve(output, 'demos', item.slug, 'index.html'), 'utf8');
      assert.ok(html.includes(`<title>${item.title} · UI Kit</title>`));
      const example = await readFile(resolve(output, 'examples', item.slug, 'index.html'), 'utf8');
      assert.ok(example.includes(`<title>${item.title} preview · UI Kit</title>`));
      assert.match(exports, new RegExp(`\\b${item.title}\\b`));
      assert.ok(stories.entries[item.story] && stories.entries[item.docs], `Missing Storybook target for ${item.title}`);
    }
  }
}
for (const asset of ['appearance.js', 'theme.css', 'vanilla/demo.css']) assert.ok((await stat(resolve(output, asset))).size > 0);
// Publish only the catalog, interactive examples, and assets used by the gallery.
assert.deepEqual((await readdir(output)).sort(), [
  'appearance.js', 'assets', 'catalog.json', 'components.json', 'demos',
  'examples', 'index.html', 'previews', 'theme.css', 'vanilla',
].sort());
console.log('Verified 31 demo pages, 14 interactive React examples, 62 previews, source links, and published assets.');
