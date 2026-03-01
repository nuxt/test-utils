import assert from 'node:assert'
import { Given, Then } from '@cucumber/cucumber'
import { createPage } from '@nuxt/test-utils/e2e'
import { runAxeOnPage } from '@nuxt/a11y/test-utils/browser'
import type { ScanResult } from '@nuxt/a11y/test-utils'

let lastScanResult: ScanResult

Given(/^the user navigates to the home page$/u, { timeout: 30000 }, async function (): Promise<void> {
  const page = await createPage('/')
  lastScanResult = await runAxeOnPage(page)
  await page.close()
})

Given(/^the user navigates to the violations page$/u, { timeout: 30000 }, async function (): Promise<void> {
  const page = await createPage('/violations')
  lastScanResult = await runAxeOnPage(page)
  await page.close()
})

Then(/^the page has no accessibility violations$/u, function (): void {
  assert.strictEqual(lastScanResult.violationCount, 0, `Expected no violations but found ${lastScanResult.violationCount}`)
})

Then(/^accessibility violations are detected$/u, function (): void {
  assert.ok(lastScanResult.violationCount > 0, 'Expected violations but found none')
})
