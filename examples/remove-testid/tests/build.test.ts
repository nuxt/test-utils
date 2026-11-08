import { expect, test } from '@nuxt/test-utils/playwright'

test('should disable feature when building in tests', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.getByTestId('hello')).toHaveText('Hello Nuxt!')
})
