import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const standalone = JSON.parse(readFileSync(new URL('../../../demos/catalog.json', import.meta.url), 'utf8'));
const library: Array<{ slug: string; title: string; docs: string; source: string }> = JSON.parse(readFileSync(new URL('../../../demos/components.json', import.meta.url), 'utf8'));
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
});
for (const demo of library) {
  test(`${demo.title} has a local interactive demo and source/documentation links`, async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await request.get(`demos/${demo.slug}/`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain(`<title>${demo.title} · UI Kit</title>`);
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => { if (response.url().includes('/ui-kit/') && response.status() >= 400) failures.push(response.url()); });
    await page.goto(`demos/${demo.slug}/`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(demo.title);
    await expect(page.locator('iframe')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Open standalone', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', `https://github.com/gbgabiola/ui-kit/blob/main/${demo.source}`);
    await expect(page.getByRole('link', { name: 'Documentation', exact: true })).toHaveAttribute('href', new RegExp(`path=/docs/${demo.docs}$`));
    const frame = page.frameLocator('iframe');
    await expect(frame.getByRole('main', { name: 'Interactive component demo' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await frame.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    switch (demo.slug) {
      case 'button':
        await frame.getByRole('button', { name: 'Add item' }).click();
        await expect(frame.getByRole('status')).toHaveText('1 item added.');
        await frame.getByRole('button', { name: 'Reset count' }).click();
        await expect(frame.getByRole('status')).toHaveText('0 items added.'); break;
      case 'textinput':
        await frame.getByLabel('Your name').fill('Alex');
        await expect(frame.getByRole('status')).toHaveText('Hello, Alex.'); break;
      case 'textarea':
        await frame.getByLabel('Message').fill('Hello');
        await expect(frame.getByRole('status')).toHaveText('5 characters'); break;
      case 'select':
        await frame.getByLabel('Workspace', { exact: true }).selectOption('team');
        await expect(frame.getByRole('status')).toContainText('team'); break;
      case 'checkbox':
        await frame.getByLabel('Email updates').check();
        await expect(frame.getByRole('status')).toHaveText('Updates enabled.'); break;
      case 'themetoggle':
        await frame.getByRole('button', { name: 'Dark mode', exact: true }).click();
        await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
        await expect(frame.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(frame.getByRole('button', { name: 'Use system theme' })).toHaveCount(0);
        await frame.getByRole('button', { name: 'Dark mode', exact: true }).click();
        await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'dark'); break;
      case 'themepaletteselect':
        await frame.getByLabel('Color palette').selectOption('forest');
        await expect(frame.getByRole('status')).toContainText('forest');
        await expect(page.locator('.gallery')).toHaveAttribute('data-palette', 'forest'); break;
      case 'navbar':
        await frame.getByRole('button', { name: 'Menu', exact: true }).click();
        await frame.getByRole('link', { name: 'Projects', exact: true }).focus();
        await page.keyboard.press('Escape');
        await expect(frame.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
        await expect(frame.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'false'); break;
      case 'sidebar':
        await frame.getByRole('button', { name: 'Project navigation' }).click();
        await expect(frame.getByRole('navigation', { name: 'Project navigation' })).toBeHidden(); break;
      case 'progressbar':
        await frame.getByRole('slider').focus(); await page.keyboard.press('End');
        await expect(frame.getByRole('progressbar')).toHaveAttribute('value', '100');
        await frame.getByRole('button', { name: 'Reset progress' }).click();
        await expect(frame.getByRole('progressbar')).toHaveAttribute('value', '0'); break;
      case 'hero':
        await frame.getByRole('button', { name: 'View projects' }).click();
        await expect(frame.getByRole('status')).toHaveText('Projects opened.'); break;
      case 'sitefooter':
        await frame.getByRole('navigation', { name: 'Explore', exact: true }).getByRole('link', { name: 'Projects' }).click();
        await expect(frame.locator('#example-projects')).toBeVisible(); break;
      case 'contentcard':
        await frame.getByRole('link', { name: 'Reading nook' }).click();
        await frame.getByRole('button', { name: 'Save project' }).click();
        await expect(frame.getByRole('status')).toHaveText('Project saved.'); break;
      case 'pricingtable':
        await frame.getByRole('button', { name: 'Choose Pro', exact: true }).click();
        await expect(frame.getByRole('status')).toHaveText('Pro selected.'); break;
      default: await expect(frame.getByRole('main', { name: 'Interactive component demo' })).toBeVisible();
    }
    expect(failures).toEqual([]);
    await page.getByRole('link', { name: 'Back to demos' }).click();
    await expect(page.getByRole('article')).toHaveCount(standalone.length + library.length);
  });
  for (const theme of ['light', 'dark']) {
    test(`${demo.title} interactive preview accessibility in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' });
      await page.goto(`demos/${demo.slug}/`);
      await expect(page.frameLocator('iframe').getByRole('main', { name: 'Interactive component demo' })).toBeVisible();
      const frame = page.frames().find((candidate) => candidate.url().includes('/examples/'))!;
      await expect(frame.locator('html')).toHaveAttribute('data-theme', theme);
      await frame.addScriptTag({ path: axePath });
      const violations = await frame.evaluate(async () => {
        const result = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
        return result.violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => ({ target: n.target, summary: n.failureSummary })) }));
      });
      expect(violations).toEqual([]);
    });
  }
}
for (const theme of ['light', 'dark'] as const) {
  test(`system ${theme} is the default until an explicit choice is made`, async ({ page }) => {
    const other = theme === 'dark' ? 'light' : 'dark';
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('./');
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => localStorage.getItem('uik-demo-appearance'))).toBeNull();
    await page.getByLabel('Color palette').selectOption('plum');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('uik-demo-appearance')!).theme)).toBe('system');
    await page.emulateMedia({ colorScheme: other });
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', other);
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', theme);
    await page.reload();
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', theme);
    await page.emulateMedia({ colorScheme: theme });
    await page.emulateMedia({ colorScheme: other });
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', theme);
    await expect(page.getByRole('button', { name: 'Use system theme' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', other);
    await page.emulateMedia({ colorScheme: theme });
    await expect(page.locator('.gallery')).toHaveAttribute('data-theme', other);
    await expect(page.locator('.gallery')).toHaveAttribute('data-palette', 'plum');
  });
}
for (const path of ['demos/button/', 'demos/progress-bar/', 'vanilla/progress-bar/']) {
  test(`${path} follows system changes without saving a manual theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    if (path.startsWith('demos/')) await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute('data-theme', 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    if (path.startsWith('demos/')) await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('uik-demo-appearance'))).toBeNull();
  });
}
test('saved choices survive system changes and synchronize across tabs', async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => localStorage.setItem('uik-demo-appearance', JSON.stringify({ theme: 'dark', palette: 'forest' })));
  await page.goto('./');
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'dark');
  const other = await context.newPage();
  await other.goto('./');
  await other.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
  await other.close();
});
test('unavailable or invalid storage falls back to system and keeps manual controls usable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => { try { localStorage.setItem('uik-demo-appearance', '{invalid'); } catch { /* Storage may be blocked. */ } });
  await page.goto('./');
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } }); });
  await page.goto('demos/themetoggle/');
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
  await page.frameLocator('iframe').getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute('data-theme', 'light');
});


test('system appearance is applied before the application bundle renders', async ({ page }) => {
  // The gallery bootstrap must not depend on a cached standalone helper.
  await page.route('**/appearance.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.emulateMedia({ colorScheme: 'light' });
  let release!: () => void;
  const ready = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/assets/index-*.js', async (route) => { await ready; await route.continue(); });
  try {
    await page.goto('./', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('#root')).toBeEmpty();
  } finally { release(); }
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
});
for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`React demo appearance on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('demos/button/');
    await expect(page.frameLocator('iframe').getByRole('button', { name: 'Add item' })).toBeVisible();
    await expect(page).toHaveScreenshot(`react-detail-${viewport.name}.png`, {
      animations: 'disabled', maxDiffPixels: 100,
    });
  });
}
