import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'bun:test'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { isWindows } from 'std-env'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  browser: true,
})

describe('browser', () => {
  it('runs a test', async () => {
    const page = await createPage('/')
    const text = await page.getByRole('heading', { name: 'Welcome to Nuxt!' }).textContent()
    expect(text).toContain('Welcome to Nuxt!')
    await page.close()
  }, isWindows ? 120000 : 20000)
})
