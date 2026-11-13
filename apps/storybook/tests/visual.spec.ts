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
