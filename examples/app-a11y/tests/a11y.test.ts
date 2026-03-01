import { expect, test } from '@nuxt/test-utils/playwright'
import type { ScanResult } from '@nuxt/a11y/test-utils'
import { runAxeOnPage, observePage } from '@nuxt/a11y/test-utils/browser'

test('accessible page has no violations', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  const result = await runAxeOnPage(page)
  expect(result.violationCount).toBe(0)
})

test('violations page detects issues', async ({ page, goto }) => {
  await goto('/violations', { waitUntil: 'hydration' })
  const result = await runAxeOnPage(page)
  expect(result.violationCount).toBeGreaterThan(0)
  expect(result.getByRule('button-name').length).toBeGreaterThan(0)
  expect(result.getByRule('image-alt').length).toBeGreaterThan(0)
  expect(result.getByRule('color-contrast').length).toBeGreaterThan(0)
})

test('filter violations by impact', async ({ page, goto }) => {
  await goto('/violations', { waitUntil: 'hydration' })
  const result = await runAxeOnPage(page)
  const critical = result.getByImpact('critical')
  const all = result.violations
  expect(critical.length).toBeLessThanOrEqual(all.length)
})

test('observePage detects dynamically added violations', async ({ page, goto }) => {
  await goto('/interactive', { waitUntil: 'hydration' })

  const results: ScanResult[] = []
  const stop = await observePage(page, (_url, result) => results.push(result))

  await page.waitForTimeout(700)
  await page.getByRole('button', { name: 'Add violation' }).click()
  await expect.poll(() => results.length, { timeout: 10_000 }).toBeGreaterThan(0)

  await stop()
})

test('observePage stop prevents further callbacks', async ({ page, goto }) => {
  await goto('/interactive', { waitUntil: 'hydration' })

  const results: ScanResult[] = []
  const stop = await observePage(page, (_url, result) => results.push(result))
  await page.waitForTimeout(700)
  await stop()

  await page.getByRole('button', { name: 'Add violation' }).click()
  await page.waitForTimeout(1000)

  expect(results.length).toBe(0)
})
