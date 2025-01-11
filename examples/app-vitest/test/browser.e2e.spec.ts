import { fileURLToPath } from 'node:url'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { isWindows } from 'std-env'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  browser: true,
  setupTimeout: isWindows ? 240000 : 120000,
})

describe('browser', () => {
  it('runs a test', { timeout: 20000 }, async () => {
    const page = await createPage('/')
    const text = await page.getByRole('heading', { name: 'Welcome to Nuxt!' }).textContent()
    expect(text).toContain('Welcome to Nuxt!')
    await page.close()
  })
})
