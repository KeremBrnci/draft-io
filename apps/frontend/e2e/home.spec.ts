import { expect, test } from '@playwright/test';

test('root redirects to play hub', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByRole('heading', { name: 'Oyna' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Oda Oluştur/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Odaya Katıl/i })).toBeVisible();
});
