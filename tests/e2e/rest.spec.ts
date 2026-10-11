import { expect, test } from '@playwright/test';
test('localized UI persists matters, messages and status through Express and PostgreSQL', async ({
  page,
}) => {
  const name = `REST engagement ${Date.now()}`;
  await page.goto('/matters/new');
  await page.locator('header select[name="locale"]').selectOption('fr');
  await page.getByLabel('Nom du dossier').fill(name);
  await page.getByLabel('Date cible').fill('2099-12-01');
  await page
    .getByLabel('Description', { exact: false })
    .fill('Persistent cross-border engagement for the client and counsel.');
  const create = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/matters') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Créer un dossier', exact: true }).click();
  expect((await create).status()).toBe(201);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  const url = page.url();
  await page.getByLabel('Statut du dossier', { exact: true }).selectOption('in_review');
  await expect(page.getByText('Statut mis à jour.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await page.getByLabel('Votre message').fill('Saved in PostgreSQL, unchanged across languages.');
  await page.getByRole('button', { name: 'Envoyer le message' }).click();
  await expect(page.getByRole('article')).toContainText('Saved in PostgreSQL');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByLabel('Statut du dossier', { exact: true })).toHaveValue('in_review');
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await expect(page.getByRole('article')).toContainText('Saved in PostgreSQL');
  await page.goto('/settings');
  await page.getByLabel('Afficher l’espace en tant que').selectOption('alex');
  // Переход внутри приложения сохраняет выбранную демоличность.
  await page.getByLabel('Recherche globale').fill(name);
  await page.getByLabel('Recherche globale').press('Enter');
  await page.getByRole('link', { name: `${name} →`, exact: true }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByLabel('Statut du dossier', { exact: true })).toHaveCount(0);
});
