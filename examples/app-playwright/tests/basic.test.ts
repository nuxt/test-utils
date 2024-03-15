import { expect, test } from '@nuxt/test-utils/playwright'

/*
You can also use the following syntax:

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
  }
})
*/

test('test', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading')).toHaveText('Welcome to Playwright!')
})
