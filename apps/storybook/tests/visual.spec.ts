import { expect, test } from '@playwright/test';

// Use the same font family on Linux workstations and CI for comparable screenshots.
const screenshotOptions = { stylePath: new URL('./snapshot-font.css', import.meta.url).pathname };

test('desktop navigation', async ({ page }) => {
  await page.goto('/iframe.html?id=navbar--default&viewMode=story');
  const navbar = page.getByRole('navigation', { name: 'Main' });
  await expect(navbar.getByRole('link', { name: 'Pricing' })).toBeVisible();
  await expect(navbar).toHaveScreenshot('navbar-desktop.png', screenshotOptions);
});

test('mobile navigation opens, closes with Escape, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 650 });
  await page.goto('/iframe.html?id=navbar--default&viewMode=story');
  const navbar = page.getByRole('navigation', { name: 'Main' });
  const menu = navbar.getByRole('button', { name: 'Menu' });
  const pricing = navbar.getByRole('link', { name: 'Pricing' });

  await expect(pricing).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(pricing).toBeVisible();
  await expect(navbar).toHaveScreenshot('navbar-mobile-open.png', screenshotOptions);

  await pricing.focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(pricing).toBeHidden();
});

test('invalid input', async ({ page }) => {
  await page.goto('/iframe.html?id=text-input--invalid&viewMode=story');
  await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
  await expect(page.locator('#storybook-root')).toHaveScreenshot('text-input-invalid.png', screenshotOptions);
});

test('Plum palette in dark mode', async ({ page }) => {
  await page.goto('/iframe.html?id=theme-palettes--dark-palette&viewMode=story');
  await expect(page.getByRole('combobox', { name: 'Color palette' })).toHaveValue('plum');
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#storybook-root')).toHaveScreenshot('plum-dark.png', screenshotOptions);
});

for (const viewport of [
  { name: 'desktop', width: 1120, height: 800 },
  { name: 'mobile', width: 390, height: 650 },
]) {
  test(`site blocks in the dark Walnut palette on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/iframe.html?id=examples-site-blocks--studio&viewMode=story');
    const hero = page.getByRole('region', { name: 'Make room for what matters.' });
    await expect(hero).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    const media = hero.locator('.uik-block-media');
    const copy = hero.getByRole('heading');
    const mediaBox = await media.boundingBox();
    const copyBox = await copy.boundingBox();
    expect(mediaBox).not.toBeNull();
    expect(copyBox).not.toBeNull();
    if (viewport.name === 'desktop') {
      expect(mediaBox!.x).toBeGreaterThan(copyBox!.x + copyBox!.width);
    } else {
      expect(mediaBox!.y).toBeGreaterThan(copyBox!.y + copyBox!.height);
    }
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `site-blocks-${viewport.name}.png`, screenshotOptions,
    );
  });
}
