import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { root, chromium, serve, prepare, settled } from '../shared/demo-browser.mjs';
const demos = JSON.parse(await readFile(resolve(root, 'demos/catalog.json')));
const components = JSON.parse(await readFile(resolve(root, 'demos/components.json')));
const gallery = await serve('apps/demo/dist');
const browser = await chromium.launch();
const only = new Set(process.argv.slice(2));
try {
  for (const [collection, items] of [['demos', demos], ['components', components]]) {
    for (const item of items.filter((item) => !only.size || only.has(item.slug))) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 960, height: 640 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      try {
        await prepare(context, theme);
        const page = await context.newPage();
        if (collection === 'demos') {
          await page.goto(`${gallery.url}/ui-kit/vanilla/${item.slug}/?embedded=1`, { waitUntil: 'networkidle' });
        } else {
          await page.goto(`${gallery.url}/ui-kit/examples/${item.slug}/?embedded=1`, { waitUntil: 'networkidle' });
          await page.locator('.component-preview').waitFor();
          await page.addStyleTag({ content: '.component-preview { min-height: 640px; }' });
        }
        await page.addStyleTag({ content: '* { font-family: "DejaVu Sans", sans-serif !important; animation: none !important; transition: none !important; caret-color: transparent !important; }' });
        await settled(page);
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        });
        const file = resolve(root, 'demos', item.previews[theme]);
        await mkdir(dirname(file), { recursive: true });
        await page.screenshot({ path: file, animations: 'disabled' });
        console.log(`${collection}/${item.slug} ${theme}`);
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); await gallery.close(); }
