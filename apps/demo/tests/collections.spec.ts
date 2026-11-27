import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const library = JSON.parse(readFileSync(new URL('../../../demos/components.json', import.meta.url), 'utf8'));
const catalog: Array<{ slug: string; title: string }> = JSON.parse(readFileSync(new URL('../../../demos/catalog.json', import.meta.url), 'utf8'));

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
  test(`${demo.slug} detail loads directly, refreshes, and embeds the standalone page`, async ({ page, request }) => {
    const response = await request.get(`demos/${demo.slug}/`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain(`<title>${demo.title} · UI Kit</title>`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`demos/${demo.slug}/`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(demo.title);
    await expect(page.getByRole('link', { name: 'Open standalone', exact: true })).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(1);
    const frame = page.frameLocator('iframe');
    await expect(frame.locator('html')).toHaveAttribute('data-embedded', 'true');
    await expect(frame.getByRole('navigation', { name: 'Demo navigation' })).toBeHidden();
    await expect.poll(() => frame.locator('body').evaluate((body) => body.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', `https://github.com/gbgabiola/ui-kit/tree/main/demos/vanilla/${demo.slug}`);
    await page.getByRole('link', { name: 'Back to demos' }).click();
    await expect(page.getByRole('article')).toHaveCount(catalog.length + library.length);
  });
}

test('theme updates preserve demo state, resize its frame, and reject unrelated messages', async ({ page }) => {
  await page.goto('demos/task-list/');
  const frame = page.frameLocator('iframe');
  await frame.getByLabel('New Task').fill('Keep this task');
  await frame.getByRole('button', { name: 'Add Task', exact: true }).click();
  await page.getByLabel('Color palette').selectOption('plum');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(frame.locator('html')).toHaveAttribute('data-palette', 'plum');
  await expect(frame.getByText('Keep this task', { exact: true })).toBeVisible();
  await expect.poll(() => page.locator('iframe').evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(480);
  await page.evaluate(() => {
    window.postMessage({ type: 'uik-height', height: 19000 }, location.origin);
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://example.com', source: document.querySelector('iframe')!.contentWindow, data: { type: 'uik-height', height: 19000 } }));
    const iframe = document.querySelector('iframe')!;
    iframe.contentWindow!.postMessage({ type: 'uik-appearance', theme: 'oops', palette: 'oops' }, location.origin);
  });
  await expect(frame.locator('html')).toHaveAttribute('data-palette', 'plum');
  expect(await page.locator('iframe').evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(19000);
  await page.locator('iframe').evaluate((el) => (el as HTMLIFrameElement).contentWindow!.postMessage({ type: 'uik-appearance', theme: 'dark', palette: 'forest' }, 'https://example.com'));
  await expect(frame.locator('html')).toHaveAttribute('data-palette', 'plum');
  // The iframe can grow and shrink without tying its document height to the viewport.
  const firstHeight = await page.locator('iframe').evaluate((el) => el.getBoundingClientRect().height);
  for (let i = 0; i < 10; i++) {
    await frame.getByLabel('New Task').fill(`Task ${i}`);
    await frame.getByRole('button', { name: 'Add Task', exact: true }).click();
  }
  await expect.poll(() => page.locator('iframe').evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(firstHeight);
  await frame.getByRole('button', { name: 'Clear Tasks' }).click();
  await expect.poll(() => page.locator('iframe').evaluate((el) => el.getBoundingClientRect().height)).toBeLessThanOrEqual(firstHeight);
});

test('gallery and standalone pages work when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
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
  for (const [name, path] of [['gallery', './'], ['detail', 'demos/progress-bar/']]) {
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Progress bar');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: 'Start Progress' }).focus();
  await page.keyboard.press('Enter');
  await expect(frame.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('link', { name: 'Back to demos' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(catalog.length + library.length);
});
