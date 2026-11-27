import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { root, chromium, serve, prepare, settled } from './demo-browser.mjs';
const demos = JSON.parse(await readFile(resolve(root, 'demos/catalog.json')));
const components = JSON.parse(await readFile(resolve(root, 'demos/components.json')));
const index = JSON.parse(await readFile(resolve(root, 'apps/storybook/storybook-static/index.json')));
const gallery = await serve('apps/demo/dist');
const storybook = await serve('apps/storybook/storybook-static');
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
          const story = item.slug === 'themetoggle' ? `theme-toggle--${theme}` : item.story;
          if (!index.entries[story]) throw new Error(`Missing story: ${story}`);
          await page.goto(`${storybook.url}/iframe.html?id=${story}&viewMode=story`, { waitUntil: 'networkidle' });
          await page.locator('#storybook-root > *').first().waitFor();
          const css = await readFile(resolve(root, 'packages/ui/src/styles/styles.css'), 'utf8');
          await page.addStyleTag({ content: css });
          await page.evaluate((theme) => {
            document.documentElement.classList.add('uik-theme');
            document.querySelectorAll('.uik-theme').forEach((el) => { el.setAttribute('data-theme', theme); el.setAttribute('data-palette', 'teal'); });
          }, theme);
        }
        await page.addStyleTag({ content: '* { font-family: "DejaVu Sans", sans-serif !important; animation: none !important; transition: none !important; caret-color: transparent !important; }' });
        await settled(page);
        await page.evaluate((collection) => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          if (collection === 'components') {
            const root = document.querySelector('#storybook-root');
            Object.assign(root.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '608px', padding: '32px', boxSizing: 'border-box' });
            const content = root.firstElementChild;
            if (content) {
              const box = content.getBoundingClientRect();
              if (box.width < 300 && box.height < 200) content.style.transform = 'scale(1.75)';
            }
          }
        }, collection);
        const file = resolve(root, 'demos', item.previews[theme]);
        await mkdir(dirname(file), { recursive: true });
        await page.screenshot({ path: file, animations: 'disabled' });
        console.log(`${collection}/${item.slug} ${theme}`);
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); await gallery.close(); await storybook.close(); }
