import { expect, test } from '@playwright/test';

test('public homepage introduces Lexora and opens the workspace', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Clarity for legal work.Across every border.',
  );
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await expect(
    page.getByText('Lexora is currently a portfolio product', { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('lexora-home.png'), fullPage: true });
  await page.getByRole('link', { name: 'Discover the platform' }).click();
  await expect(page).toHaveURL(/#platform$/);
  await page.getByRole('link', { name: 'Enter the demo workspace' }).click();
  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole('heading', { name: 'Good to see you, Olivia' })).toBeVisible();
});
