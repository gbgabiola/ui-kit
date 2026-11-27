import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expectAccessible } from './accessibility';
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
    await expect(page.locator('#demo-title')).toHaveText(demo.title);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open standalone', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', `https://github.com/gbgabiola/ui-kit/blob/main/${demo.source}`);
    await expect(page.getByRole('link', { name: 'Documentation', exact: true })).toHaveAttribute('href', new RegExp(`path=/docs/${demo.docs}$`));
    await expect(page.getByRole('main', { name: 'Interactive component demo' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    switch (demo.slug) {
      case 'button':
        await page.getByRole('button', { name: 'Add item' }).click();
        await expect(page.getByRole('status')).toHaveText('1 item added.');
        await page.getByRole('button', { name: 'Reset count' }).click();
        await expect(page.getByRole('status')).toHaveText('0 items added.'); break;
      case 'textinput':
        await page.getByLabel('Your name').fill('Alex');
        await expect(page.getByRole('status')).toHaveText('Hello, Alex.'); break;
      case 'textarea':
        await page.getByLabel('Message').fill('Hello');
        await expect(page.getByRole('status')).toHaveText('5 characters'); break;
      case 'select':
        await page.getByLabel('Workspace', { exact: true }).selectOption('team');
        await expect(page.getByRole('status')).toContainText('team'); break;
      case 'checkbox':
        await page.getByLabel('Email updates').check();
        await expect(page.getByRole('status')).toHaveText('Updates enabled.'); break;
      case 'themetoggle':
        await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(page.getByRole('button', { name: 'Use system theme' })).toHaveCount(0);
        await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark'); break;
      case 'themepaletteselect':
        await page.getByRole('main').getByLabel('Color palette').selectOption('forest');
        await expect(page.getByRole('status')).toContainText('forest');
        await expect(page.locator('html')).toHaveAttribute('data-palette', 'forest'); break;
      case 'navbar':
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
        await page.getByRole('link', { name: 'Projects', exact: true }).focus();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
        await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'false'); break;
      case 'sidebar':
        await page.getByRole('button', { name: 'Project navigation' }).click();
        await expect(page.getByRole('navigation', { name: 'Project navigation' })).toBeHidden(); break;
      case 'progressbar':
        await page.getByRole('slider').focus(); await page.keyboard.press('End');
        await expect(page.getByRole('progressbar')).toHaveAttribute('value', '100');
        await page.getByRole('button', { name: 'Reset progress' }).click();
        await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0'); break;
      case 'hero':
        await page.getByRole('button', { name: 'View projects' }).click();
        await expect(page.getByRole('status')).toHaveText('Projects opened.'); break;
      case 'sitefooter':
        await page.getByRole('navigation', { name: 'Explore', exact: true }).getByRole('link', { name: 'Projects' }).click();
        await expect(page.locator('#example-projects')).toBeVisible(); break;
      case 'contentcard':
        await page.getByRole('link', { name: 'Reading nook' }).click();
        await page.getByRole('button', { name: 'Save project' }).click();
        await expect(page.getByRole('status')).toHaveText('Project saved.'); break;
      case 'pricingtable':
        await page.getByRole('button', { name: 'Choose Pro', exact: true }).click();
        await expect(page.getByRole('status')).toHaveText('Pro selected.'); break;
      default: await expect(page.getByRole('main', { name: 'Interactive component demo' })).toBeVisible();
    }
    expect(failures).toEqual([]);
    await page.getByRole('link', { name: 'All demos', exact: false }).click();
    await expect(page.getByRole('article')).toHaveCount(standalone.length + library.length);
  });
  for (const theme of ['light', 'dark']) {
    test(`${demo.title} interactive preview accessibility in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' });
      await page.goto(`demos/${demo.slug}/`);
      await expect(page.getByRole('main', { name: 'Interactive component demo' })).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expectAccessible(page);
    });
  }
}
for (const theme of ['light', 'dark'] as const) {
  test(`system ${theme} is the default until an explicit choice is made`, async ({ page }) => {
    const other = theme === 'dark' ? 'light' : 'dark';
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => localStorage.getItem('uik-demo-appearance'))).toBeNull();
    await page.getByLabel('Color palette').selectOption('plum');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('uik-demo-appearance')!).theme)).toBe('system');
    await page.emulateMedia({ colorScheme: other });
    await expect(page.locator('html')).toHaveAttribute('data-theme', other);
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.emulateMedia({ colorScheme: theme });
    await page.emulateMedia({ colorScheme: other });
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.getByRole('button', { name: 'Use system theme' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', other);
    await page.emulateMedia({ colorScheme: theme });
    await expect(page.locator('html')).toHaveAttribute('data-theme', other);
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'plum');
  });
}
for (const path of ['demos/button/', 'demos/progress-bar/']) {
  test(`${path} follows system changes without saving a manual theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('uik-demo-appearance'))).toBeNull();
  });
}
test('saved choices survive system changes and synchronize across tabs', async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => localStorage.setItem('uik-demo-appearance', JSON.stringify({ theme: 'dark', palette: 'forest' })));
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const other = await context.newPage();
  await other.goto('./');
  await other.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await other.close();
});
test('unavailable or invalid storage falls back to system and keeps manual controls usable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => { try { localStorage.setItem('uik-demo-appearance', '{invalid'); } catch { /* Storage may be blocked. */ } });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } }); });
  await page.goto('demos/themetoggle/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
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
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`React demo appearance on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('demos/button/');
    await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
    await expect(page).toHaveScreenshot(`react-detail-${viewport.name}.png`, {
      animations: 'disabled', maxDiffPixels: 100,
    });
  });
}
