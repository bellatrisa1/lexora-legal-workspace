import { expect, test, type Page } from '@playwright/test';
async function demoRole(page: Page, id: string) {
  await page.goto('/settings');
  await page.getByLabel('Preview workspace as').selectOption(id);
}
test('client creates a matter, exchanges messages and sees lawyer status updates', async ({
  page,
}) => {
  await demoRole(page, 'alex');
  await page.getByRole('link', { name: 'New Matter', exact: true }).click();
  await page.getByRole('button', { name: 'Create matter', exact: true }).click();
  await expect(page.getByText('Enter at least 5 characters')).toBeVisible();
  await page.getByLabel('Matter name').fill('Global licensing engagement');
  await page.getByLabel('Target date').fill('2099-12-01');
  await page
    .getByLabel('Description', { exact: false })
    .fill('Coordinate the licensing review with the client and international counsel.');
  await page.getByRole('button', { name: 'Create matter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Global licensing engagement' })).toBeVisible();
  const url = page.url();
  await expect(page.getByLabel('Matter status', { exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await page.getByLabel('Your message').fill('Please review our commercial instructions.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(
    page.getByText('Please review our commercial instructions.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(1);
  if (await page.getByRole('button', { name: 'Navigation', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('dialog').getByLabel('Demo role').selectOption('olivia');
    await page.keyboard.press('Escape');
  } else await page.getByRole('complementary').getByLabel('Demo role').selectOption('olivia');
  await page.getByLabel('Matter status', { exact: true }).selectOption('in_review');
  await expect(page.getByText('Status updated.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Activity', exact: true }).click();
  await expect(
    page
      .getByRole('tabpanel', { name: 'Activity' })
      .getByText('changed status from Open to In Review', { exact: false }),
  ).toBeVisible();
  expect(page.url()).toBe(url);
});
test('search, filters, empty states and recovery from an API error', async ({ page }) => {
  await page.goto('/matters');
  await page.getByLabel('Status filter').selectOption('client_action');
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.getByLabel('Search matters').fill('unmatched matter');
  await expect(page.getByRole('heading', { name: 'No matters found' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByLabel('Practice area filter').selectOption('ip');
  await expect(page.getByRole('row')).toHaveCount(4);
  await page.getByLabel('Jurisdiction filter').selectOption('eu');
  await expect(
    page.getByRole('link', { name: 'EU Trademark Registration', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Lead counsel filter').selectOption('lucas');
  await page.getByLabel('Sort matters').selectOption('name');
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.goto('/help');
  await page.getByRole('button', { name: 'Simulate API error' }).click();
  if (await page.getByRole('button', { name: 'Navigation', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Matters', exact: true })
      .click();
  } else
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Matters', exact: true })
      .click();
  await expect(page.getByRole('heading', { name: 'Unable to load this workspace' })).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'Matters', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('documents, tasks, connected clients and global search remain usable', async ({ page }) => {
  await page.goto('/documents');
  await page.getByLabel('Search documents').fill('Share purchase');
  const download = page.waitForEvent('download');
  await page
    .getByRole('link', { name: 'Download demo sample: Share purchase agreement', exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe('Share purchase agreement.demo.txt');
  await page.goto('/tasks');
  await page
    .getByLabel('Status for Resolve outstanding due diligence questions', { exact: true })
    .selectOption('completed');
  await expect(page.getByText('Task updated.', { exact: true })).toBeVisible();
  await page.getByLabel('Task filter').selectOption('completed');
  await expect(
    page.getByText('Resolve outstanding due diligence questions', { exact: true }),
  ).toBeVisible();
  await page.goto('/clients');
  await page.getByRole('link', { name: 'Asteria Technologies Ltd.', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Northstar Acquisition', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Global search').fill('Northstar');
  await page.getByLabel('Global search').press('Enter');
  await expect(page.getByRole('heading', { name: 'Search workspace' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Northstar Acquisition →', exact: true }),
  ).toBeVisible();
  await page.goto('/calendar');
  await page.getByLabel('Calendar range').selectOption('all');
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.locator('main a[href="/matters/1048?tab=overview"]')).toBeVisible();
});
test('navigation and native dialogs work with keyboard and mobile', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/overview');
  await expect(page.getByRole('heading', { name: 'Good to see you, Olivia' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('lexora-overview.png'), fullPage: true });
  for (const [name, heading] of [
    ['Matters', 'Matters'],
    ['Clients', 'Clients'],
    ['Documents', 'Documents'],
    ['Tasks', 'Tasks'],
    ['Messages', 'Messages'],
    ['Calendar', 'Calendar'],
    ['Analytics', 'Workspace insights'],
    ['Legal Team', 'Legal team'],
    ['Settings', 'Settings'],
  ] as const) {
    if (await page.getByRole('button', { name: 'Navigation', exact: true }).isVisible()) {
      await page.getByRole('button', { name: 'Navigation', exact: true }).click();
      await page
        .getByRole('navigation', { name: 'Mobile navigation' })
        .getByRole('link', { name, exact: true })
        .click();
      await expect(page.getByRole('dialog', { name: 'Navigation' })).not.toBeVisible();
    } else await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Workspace updates', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Workspace updates', exact: true })).toBeFocused();
  await page.goto('/matters/1048');
  await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Documents (2)' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Documents (2)' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(errors).toEqual([]);
});
