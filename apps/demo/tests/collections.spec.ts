import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const library = JSON.parse(readFileSync(new URL('../../../demos/components.json', import.meta.url), 'utf8'));
const catalog: Array<{ slug: string; title: string; description: string }> = JSON.parse(readFileSync(new URL('../../../demos/catalog.json', import.meta.url), 'utf8'));

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.route('https://ghibliapi.vercel.app/people', (route) => route.fulfill({ json: [{ name: 'Satsuki', age: '11' }] }));
  await page.addInitScript(() => { Math.random = () => .25; });
});

test('technology, purpose, and search filters combine and reset', async ({ page }) => {
  await page.goto('./');
  const technologies = page.getByRole('group', { name: 'Filter demos by technology' });
  await technologies.getByRole('button', { name: 'HTML/CSS', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(8);
  await page.getByRole('button', { name: 'Forms', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByRole('searchbox').fill('survey');
  await expect(page.getByRole('article')).toHaveCount(1);
  await technologies.getByRole('button', { name: 'HTML/CSS/JavaScript', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('article')).toHaveCount(catalog.length + library.length);
  await technologies.getByRole('button', { name: 'HTML/CSS/JavaScript', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(9);
});

test('one gallery includes every item with mode-specific previews and working demo links', async ({ page, request }) => {
  await page.goto('./#components');
  await expect(page.getByRole('article')).toHaveCount(catalog.length + library.length);
  await expect(page.getByRole('navigation', { name: 'Collections' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Components', exact: true })).toHaveCount(0);
  await page.getByRole('group', { name: 'Filter demos by technology' }).getByRole('button', { name: 'React', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(library.length);
  for (const image of await page.locator('.card-preview').all()) {
    await expect(image).toHaveAttribute('loading', 'lazy');
    const response = await request.get((await image.getAttribute('src'))!);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  await expect(page.getByRole('link', { name: 'Open Button', exact: false })).toHaveAttribute('href', /demos\/button\/$/);
  await expect(page.locator('.card-preview').first()).toHaveAttribute('src', /-dark.png$/);
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('.card-preview').first()).toHaveAttribute('src', /-light.png$/);
});

for (const demo of catalog) {
  test(`${demo.slug} workspace loads directly, refreshes, and keeps the standalone URL working`, async ({ page, request }) => {
    const response = await request.get(`demos/${demo.slug}/`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain(`<title>${demo.title} · UI Kit</title>`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`demos/${demo.slug}/`);
    await page.reload();
    await expect(page.locator('#demo-title')).toHaveText(demo.title);
    await expect(page.getByRole('link', { name: 'Open standalone', exact: true })).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Demo navigation' })).toBeVisible();
    await expect(page.locator('.demo-info p')).toHaveText(demo.description);
    await expect(page.locator('.demo-technology')).not.toBeEmpty();
    await expect(page.locator('.uik-site-footer')).toHaveCount(0);
    await page.goto(`vanilla/${demo.slug}/`);
    await expect(page.locator('#demo-title')).toHaveText(demo.title);
    await expect(page.getByRole('navigation', { name: 'Demo navigation' })).toHaveCount(1);
    await expect.poll(() => page.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', `https://github.com/gbgabiola/ui-kit/tree/main/demos/vanilla/${demo.slug}`);
    await page.getByRole('link', { name: 'All demos', exact: false }).click();
    await expect(page.getByRole('article')).toHaveCount(catalog.length + library.length);
  });
}

test('theme updates preserve native state and ignore obsolete frame messages', async ({ page }) => {
  await page.goto('demos/task-list/');
  await page.getByLabel('New Task').fill('Keep this task');
  await page.getByRole('button', { name: 'Add Task', exact: true }).click();
  await page.getByLabel('Color palette').selectOption('plum');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'plum');
  await expect(page.getByText('Keep this task', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    window.postMessage({ type: 'uik-height', height: 19000 }, location.origin);
    window.postMessage({ type: 'uik-appearance', theme: 'dark', palette: 'forest' }, location.origin);
  });
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'plum');
  await expect(page.locator('iframe')).toHaveCount(0);
  for (let i = 0; i < 10; i++) {
    await page.getByLabel('New Task').fill(`Task ${i}`);
    await page.getByRole('button', { name: 'Add Task', exact: true }).click();
  }
  await expect(page.locator('.collection-item')).toHaveCount(11);
  await page.getByRole('button', { name: 'Clear Tasks' }).click();
  await expect(page.locator('.collection-item')).toHaveCount(0);
});

test('gallery and standalone pages work when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goto('vanilla/progress-bar/');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.getByLabel('Color palette').selectOption('forest');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'forest');
  await page.getByRole('button', { name: 'Start Progress' }).click();
  await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0');
});

for (const theme of ['light', 'dark']) {
  for (const demo of catalog) {
    test(`${demo.slug} accessibility in ${theme}`, async ({ page }) => {
      await page.addInitScript((theme) => localStorage.setItem('uik-demo-appearance', JSON.stringify({ theme, palette: 'teal' })), theme);
      await page.goto(`vanilla/${demo.slug}/`);
      await page.addScriptTag({ path: axePath });
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
        return result.violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => ({ target: n.target, summary: n.failureSummary })) }));
      });
      expect(violations).toEqual([]);
    });
  }
  test(`components and detail accessibility in ${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem('uik-demo-appearance', JSON.stringify({ theme, palette: 'teal' })), theme);
    for (const path of ['./', 'demos/progress-bar/']) {
      await page.goto(path);
      await page.addScriptTag({ path: axePath });
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
        return result.violations.map((v: any) => ({ id: v.id, targets: v.nodes.map((n: any) => n.target) }));
      });
      expect(violations).toEqual([]);
    }
  });
}

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const [name, path] of [['gallery', './'], ['detail', 'demos/progress-bar/'], ['blog', 'demos/blog-post-card/']]) {
    test(`${name} appearance on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}-${viewport.name}.png`, {
        animations: 'disabled',
        // Linux font builds can differ by a few rasterized text-edge pixels.
        maxDiffPixels: 100,
      });
    });
  }
}


test('keyboard navigation opens a detail page and operates its preview', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Open Progress bar', exact: false }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#demo-title')).toHaveText('Progress bar');
  await page.getByRole('button', { name: 'Start Progress' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('link', { name: 'All demos', exact: false }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(catalog.length + library.length);
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`full-window workspace stays usable at ${viewport.width} by ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('demos/blog-post-card/');
    await expect(page.locator('#demo-title')).toHaveText('Blog post card');
    await expect(page.locator('.demo-technology')).toHaveText('HTML/CSS');
    const card = page.locator('.blog-post-card');
    await expect(card).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('.uik-site-footer')).toHaveCount(0);
    const geometry = await page.evaluate(() => {
      const header = document.querySelector('.demo-info')!.getBoundingClientRect();
      const controls = document.querySelector('.demo-navigation')!.getBoundingClientRect();
      const card = document.querySelector('.blog-post-card')!.getBoundingClientRect();
      return { headerBottom: header.bottom, controlsTop: controls.top, controlsBottom: controls.bottom,
        cardTop: card.top, cardBottom: card.bottom, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(geometry.overflow).toBe(false);
    expect(geometry.cardTop).toBeGreaterThanOrEqual(geometry.headerBottom);
    expect(geometry.controlsBottom).toBeLessThanOrEqual(viewport.height);
    await card.getByRole('link', { name: 'Read More' }).focus();
    await expect(card.getByRole('link', { name: 'Read More' })).toBeFocused();
    const bottom = await card.getByRole('link', { name: 'Read More' }).evaluate((link) => link.getBoundingClientRect().bottom);
    expect(bottom).toBeLessThanOrEqual(geometry.controlsTop);
  });
}
