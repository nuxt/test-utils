import { fileURLToPath } from 'node:url'
import { createPage, setup, url } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { isWindows } from 'std-env'
import { runAxeOnPage } from '@nuxt/a11y/test-utils/browser'

await setup({
  rootDir: fileURLToPath(new URL('../../', import.meta.url)),
  browser: true,
  a11y: { threshold: 999 },
  setupTimeout: isWindows ? 240000 : 120000,
})

describe('browser a11y scanning', () => {
  it('accessible page has no violations', { timeout: 20000 }, async () => {
    const page = await createPage('/')
    const result = await runAxeOnPage(page)
    expect(result.violationCount).toBe(0)
    await page.close()
  })

  it('violations page detects issues', { timeout: 20000 }, async () => {
    const page = await createPage('/violations')
    const result = await runAxeOnPage(page)
    expect(result.violationCount).toBeGreaterThan(0)
    expect(result.getByRule('button-name').length).toBeGreaterThan(0)
    await page.close()
  })
})
