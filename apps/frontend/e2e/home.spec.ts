import { expect, test } from '@playwright/test';

test('home page displays platform title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Gerçek futbol verisiyle kadronu kur' })).toBeVisible();
  await expect(page.getByText(/Futbol draft platformu/i)).toBeVisible();
});
