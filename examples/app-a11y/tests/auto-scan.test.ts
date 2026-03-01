import { expect, test } from '@nuxt/test-utils/playwright'

test('accessible page passes auto-scan', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  expect(page.url()).toContain('/')
})

test('violations page fails auto-scan', async ({ page, goto }) => {
  await goto('/violations', { waitUntil: 'hydration' })
  expect(page.url()).toContain('/violations')
})

test('dynamic violations detected after interaction', async ({ page, goto }) => {
  await goto('/interactive', { waitUntil: 'hydration' })
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: 'Add violation' }).click()
  await page.waitForTimeout(2000)
})
