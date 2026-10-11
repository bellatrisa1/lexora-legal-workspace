import { expect, test } from '@playwright/test';
const languages = [
  ['en', 'Matters', 'Language'],
  ['ru', 'Дела', 'Язык'],
  ['es', 'Asuntos', 'Idioma'],
  ['fr', 'Dossiers', 'Langue'],
  ['it', 'Pratiche', 'Lingua'],
] as const;
test('switches every locale, persists it and keeps names and content intact', async ({
  page,
  context,
}) => {
  await page.goto('/matters');
  for (const [locale, heading] of languages) {
    await page.locator('header select[name="locale"]').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Northstar Acquisition', exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    expect((await context.cookies()).find((c) => c.name === 'portal_locale')?.value).toBe(locale);
  }
});
test('locale changes preserve unsaved forms and localize existing validation', async ({ page }) => {
  await page.goto('/matters/new');
  await page.getByLabel('Matter name').fill('International content preserved');
  await page.getByRole('button', { name: 'Create matter', exact: true }).click();
  await expect(page.getByText('Describe the task in at least 20 characters')).toBeVisible();
  await page.locator('header select[name="locale"]').selectOption('ru');
  await expect(page.getByLabel('Название дела')).toHaveValue('International content preserved');
  await expect(page.getByText('Опишите задачу: минимум 20 символов')).toBeVisible();
  await page.getByLabel('Целевая дата').fill('2099-12-01');
  await page
    .getByLabel('Описание', { exact: false })
    .fill('A cross-border matter with client-provided instructions.');
  await page.getByRole('button', { name: 'Создать дело', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'International content preserved' }),
  ).toBeVisible();
  await page.locator('header select[name="locale"]').selectOption('fr');
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await page.getByLabel('Votre message').fill('Client content stays unchanged.');
  await page.getByRole('button', { name: 'Envoyer le message' }).click();
  await page.locator('header select[name="locale"]').selectOption('it');
  await expect(page.getByText('Client content stays unchanged.', { exact: true })).toBeVisible();
});
test('timezone and jurisdiction remain independent of locale', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Display timezone').selectOption('Asia/Singapore');
  await expect(page.getByRole('status')).toHaveText('Timestamps displayed in Asia/Singapore.');
  await page.locator('header select[name="locale"]').selectOption('es');
  await expect(page.getByLabel('Zona horaria de visualización')).toHaveValue('Asia/Singapore');
  await expect(page.getByRole('status')).toHaveText('Horas mostradas en Asia/Singapore.');
  await page.getByRole('link', { name: 'Nuevo asunto', exact: true }).click();
  await page.getByLabel('Jurisdicción', { exact: false }).selectOption('ny');
  await expect(page.getByLabel('Jurisdicción', { exact: false })).toHaveValue('ny');
});
test('server detects browser language, honors cookies, falls back and preserves old routes', async ({
  browser,
  baseURL,
}) => {
  for (const [browserLocale, expected] of [
    ['ru-RU', 'ru'],
    ['es-MX', 'es'],
    ['fr-CA', 'fr'],
    ['it-IT', 'it'],
    ['ja-JP', 'en'],
  ]) {
    const context = await browser.newContext({ locale: browserLocale, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(baseURL! + '/');
    await expect(page.locator('html')).toHaveAttribute('lang', expected);
    await context.close();
  }
  const context = await browser.newContext({ locale: 'ru-RU' });
  await context.addCookies([{ name: 'portal_locale', value: 'fr', url: baseURL! }]);
  const page = await context.newPage();
  await page.goto(baseURL! + '/requests/1048');
  await expect(page).toHaveURL(/\/matters\/1048$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { name: 'Northstar Acquisition' })).toBeVisible();
  await context.close();
});
test('public homepage supports every language without horizontal overflow', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  for (const [locale] of languages) {
    await page.locator('header select[name="locale"]').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.screenshot({ path: testInfo.outputPath('localized-home.png'), fullPage: true });
});
