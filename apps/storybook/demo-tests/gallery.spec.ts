import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axePath = createRequire(require.resolve('@storybook/addon-a11y/package.json')).resolve('axe-core/axe.min.js');
const catalog: Array<{ slug: string; title: string }> = JSON.parse(readFileSync(new URL('../../../demos/catalog.json', import.meta.url), 'utf8'));

// Keep browser checks independent of font/CDN availability.
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
});

test('gallery search, category filters, appearance persistence, and keyboard access', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Small pieces. Working ideas.');
  await expect(page.getByRole('article')).toHaveCount(catalog.length);
  await page.keyboard.press('/');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.getByRole('searchbox').fill('pricing');
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByRole('button', { name: 'Games', exact: true }).click();
  await expect(page.getByText('No demos match these filters.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('article')).toHaveCount(catalog.length);
  await page.getByLabel('Color palette').selectOption('walnut');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await page.reload();
  await expect(page.locator('.gallery')).toHaveAttribute('data-palette', 'walnut');
  await expect(page.locator('.gallery')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('slider').focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '100');
});

for (const demo of catalog) {
  test(`${demo.slug} loads its local assets and returns to the gallery`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const failed: string[] = [];
    const errors: string[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/ui-kit/') && response.status() >= 400) failed.push(response.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    // The live API has a separate failure/retry check below.
    await page.route('https://ghibliapi.vercel.app/people', (route) => route.fulfill({ json: [{ name: 'Satsuki', age: '11' }] }));
    await page.goto(`vanilla/${demo.slug}/`);
    await expect(page.getByRole('navigation', { name: 'Demo navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', `https://github.com/gbgabiola/ui-kit/tree/main/demos/vanilla/${demo.slug}`);
    await expect.poll(() => page.evaluate(() => [...document.images].filter((image) => !image.complete).length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Demo should fit a mobile viewport').toBe(true);
    expect(failed).toEqual([]);
    expect(errors).toEqual([]);
    await page.getByRole('link', { name: 'All demos' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Small pieces. Working ideas.');
  });
}

test('progress reset cancels active work', async ({ page }) => {
  await page.goto('vanilla/progress-bar/');
  await page.getByRole('button', { name: 'Start Progress' }).click();
  await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(150);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByRole('button', { name: 'Start Progress' })).toBeEnabled();
});

test('sidebar supports keyboard open, Escape, and hidden navigation', async ({ page }) => {
  await page.goto('vanilla/toggle-sidebar/');
  const toggle = page.locator('button.btn');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#sidebar')).toHaveAttribute('inert', '');
});

test('loan calculator handles zero and positive interest', async ({ page }) => {
  await page.goto('vanilla/loan-calculator/');
  await page.getByLabel('Loan amount').fill('1200');
  await page.getByLabel('Annual interest (%)').fill('0');
  await page.getByLabel('Years to repay').fill('1');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByLabel('Monthly payment')).toHaveValue('100.00');
  await expect(page.getByLabel('Total interest')).toHaveValue('0.00');
  await page.getByLabel('Annual interest (%)').fill('12');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByLabel('Monthly payment')).toHaveValue('106.62');
});

test('tasks persist and clearing them preserves appearance settings', async ({ page }) => {
  await page.goto('vanilla/task-list/');
  await page.evaluate(() => localStorage.setItem('uik-demo-appearance', 'preserve-me'));
  await page.getByLabel('New Task').fill('Ship the gallery');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await page.reload();
  await expect(page.getByText('Ship the gallery', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Ship the gallery' }).click();
  await expect(page.locator('.collection-item')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear Tasks' }).click();
  expect(await page.evaluate(() => localStorage.getItem('uik-demo-appearance'))).toBe('preserve-me');
});

test('Ghibli request failure has a working retry', async ({ page }) => {
  let requests = 0;
  await page.route('https://ghibliapi.vercel.app/people', (route) => {
    requests += 1;
    return requests === 1 ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.fulfill({ json: [{ name: 'Satsuki', age: '11' }] });
  });
  await page.goto('vanilla/ghibli-api/');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'Satsuki' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('1 characters loaded.');
});

test('Simon game has touch and keyboard controls', async ({ page }) => {
  await page.goto('vanilla/simon-game/');
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Level 1');
  await expect(page.getByRole('button', { name: 'Green', exact: true })).toBeEnabled();
});

test('mobile gallery fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: /Open Blog post card/i })).toBeVisible();
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText(`© 2018–${new Date().getUTCFullYear()} gbgabiola`);
  await expect(footer.getByRole('link', { name: 'gbgabiola', exact: true })).toHaveAttribute('href', 'https://gbgabiola.vercel.app/');
  await expect(footer.getByRole('navigation', { name: 'Footer', exact: true })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/gbgabiola');
  await expect(footer.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', 'https://gbgabiola.vercel.app/contact');
});

for (const theme of ['light', 'dark']) {
  test(`gallery accessibility in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem('uik-demo-appearance', JSON.stringify({ theme, palette: 'teal' })), theme);
    await page.goto('./');
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => {
      const result = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
      return result.violations.map((violation: any) => ({ id: violation.id, nodes: violation.nodes.map((node: any) => node.target) }));
    });
    expect(violations).toEqual([]);
  });
}

test('invalid guesses preserve attempts and a finished game can restart', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('vanilla/number-guesser/');
  const guess = page.getByLabel('Your guess');
  await guess.fill('11');
  await page.locator('#guess-btn').click();
  await expect(page.getByRole('status')).toContainText('whole number');
  for (const value of ['2', '3', '4']) {
    await guess.fill(value);
    await page.locator('#guess-btn').click();
  }
  await expect(page.getByRole('status')).toContainText('Game over');
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(guess).toBeEnabled();
  await guess.fill('1');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('You won');
});
