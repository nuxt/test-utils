import { expect, test } from '../customFixtures'

test('test', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading')).toHaveText('Welcome to Playwright!')
})
