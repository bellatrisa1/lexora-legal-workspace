import { expect, test } from '@playwright/test';
// These existing scenarios now verify the English-only product boundary. Full locale switching returns in phase 2.
test('new product remains English for all future browser languages', async ({ page, context }) => {
  await context.addCookies([{ name: 'portal_locale', value: 'ru', url: 'http://127.0.0.1:3107' }]);
  await page.goto('/overview');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Lexora — Global Legal Workspace');
  await page.getByRole('button', { name: 'Language preferences', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'English workspace' })).toBeVisible();
  await expect(
    page.getByText('Russian, Spanish, French and Italian are planned for the next stage.', {
      exact: false,
    }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
test('display preferences preserve a created matter and never alter its content', async ({
  page,
}) => {
  await page.goto('/matters/new');
  await page.getByLabel('Matter name').fill('International content preserved');
  await page.getByLabel('Target date').fill('2099-12-01');
  await page
    .getByLabel('Description', { exact: false })
    .fill('A cross-border matter with client-provided instructions.');
  await page.getByRole('button', { name: 'Create matter', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'International content preserved' }),
  ).toBeVisible();
  await page.getByLabel('Global search').fill('International content preserved');
  await page.getByLabel('Global search').press('Enter');
  await expect(
    page.getByRole('link', { name: 'International content preserved →', exact: true }),
  ).toBeVisible();
});
test('timezone selection is independent of language and jurisdiction', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Display timezone').selectOption('Asia/Singapore');
  await expect(page.getByRole('status')).toHaveText('Timestamps displayed in Asia/Singapore.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'New Matter', exact: true }).click();
  await page.getByLabel('Jurisdiction', { exact: false }).selectOption('ny');
  await expect(page.getByLabel('Jurisdiction', { exact: false })).toHaveValue('ny');
});
test('English server-rendered shell and legacy routes remain accessible', async ({
  browser,
  baseURL,
}) => {
  for (const locale of ['en-US', 'ru-RU', 'es-ES', 'fr-FR', 'it-IT']) {
    const context = await browser.newContext({ locale, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(baseURL! + '/help');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('link', { name: 'New Matter', exact: true })).toBeVisible();
    await context.close();
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseURL! + '/requests/1048');
  await expect(page).toHaveURL(/\/matters\/1048$/);
  await expect(page.getByRole('heading', { name: 'Northstar Acquisition' })).toBeVisible();
  await page.goto(baseURL! + '/not-a-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await context.close();
});
