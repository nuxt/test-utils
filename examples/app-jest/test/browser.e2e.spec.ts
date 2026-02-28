import { fileURLToPath } from 'node:url'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { isWindows } from 'std-env'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  browser: true,
  a11y: true,
})

describe('browser', () => {
  it('runs a test', async () => {
    const page = await createPage('/')
    const text = await page.getByRole('heading', { name: 'Get started' }).textContent()
    expect(text).toContain('Get started')
    await page.close()
  }, isWindows ? 120000 : 20000)
})
