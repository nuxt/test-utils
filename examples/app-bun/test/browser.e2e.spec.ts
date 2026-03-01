import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'bun:test'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { isWindows } from 'std-env'

// Skip tests on windows because playwright cannot be launched with bun.
// See: https://github.com/oven-sh/bun/issues/15679

if (!isWindows) {
  await setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url)),
    browser: true,
  })
}

describe.skipIf(isWindows)('browser', () => {
  it('runs a test', async () => {
    const page = await createPage('/')
    const text = await page.getByRole('heading', { name: 'Get started' }).textContent()
    expect(text).toContain('Get started')
    await page.close()
  }, isWindows ? 120000 : 20000)
})
