import { expect, test } from '@nuxt/test-utils/playwright'

test('test', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading')).toHaveText('Welcome to Playwright!')
})

const testHello = test.extend({
  nuxt: async ({ nuxt }, use) => {
    nuxt!.env = {
      NUXT_PUBLIC_MY_VALUE: 'Hello World!',
    }
    await use(nuxt)
  },
})

testHello('testing', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading')).toHaveText('Hello World!')
})
