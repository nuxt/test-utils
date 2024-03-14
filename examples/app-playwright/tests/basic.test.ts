import { expect, test } from '@nuxt/test-utils/playwright'

/*
You can also use the following syntax:

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
  }
})
*/

test('test', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading')).toHaveText('Welcome to Playwright!')
})
