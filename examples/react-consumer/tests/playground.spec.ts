import { expect, test } from '@playwright/test';

test('mobile navigation opens and Escape restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 650 });
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Main' });
  const menu = navigation.getByRole('button', { name: 'Menu' });
  const appearance = navigation.getByRole('link', { name: 'Appearance' });

  await expect(appearance).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(appearance).toBeVisible();
  await appearance.focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(appearance).toBeHidden();
});

test('the installed stylesheet responds to theme and palette choices', async ({ page }) => {
  await page.goto('/');
  const playground = page.locator('#top');
  const mode = page.getByRole('button', { name: 'Dark mode' });
  const palette = page.getByRole('combobox', { name: 'Color palette' });

  await expect(playground).toHaveCSS('color-scheme', 'light');
  await mode.click();
  await expect(mode).toHaveAttribute('aria-pressed', 'true');
  await expect(playground).toHaveCSS('color-scheme', 'dark');
  const classicSurface = await playground.evaluate((element) => getComputedStyle(element).backgroundColor);

  await palette.selectOption('walnut');
  await expect(playground).toHaveAttribute('data-palette', 'walnut');
  await expect(playground).not.toHaveCSS('background-color', classicSurface);
  await expect(playground).toHaveCSS('color-scheme', 'dark');
});

test('the form blocks incomplete submissions and displays the local result', async ({ page }) => {
  await page.goto('/');
  const email = page.getByRole('textbox', { name: 'Email' });
  const status = page.getByRole('status');
  const submit = page.getByRole('button', { name: 'Submit sample enquiry' });

  await submit.click();
  await expect(email).toBeFocused();
  await expect(status).toBeEmpty();

  await email.fill('alex@example.com');
  await page.getByRole('combobox', { name: 'Service' }).selectOption('Design');
  await page.getByRole('textbox', { name: 'Message' }).fill('I need a built-in bookshelf.');
  const updates = page.getByRole('checkbox', { name: 'Send me project updates' });
  await updates.check();
  await submit.click();
  await expect(status).toHaveText('Sample enquiry for Design. Updates on.');

  await updates.uncheck();
  await expect(status).toBeEmpty();
  await submit.click();
  await expect(status).toHaveText('Sample enquiry for Design. Updates off.');
});
