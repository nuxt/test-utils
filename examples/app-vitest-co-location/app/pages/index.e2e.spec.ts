import { fileURLToPath } from 'node:url'
import { it, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../../', import.meta.url)),
  browser: true,
})

it('runs e2e browser test', { timeout: 20000 }, async ({ onTestFinished }) => {
  const page = await createPage('/')
  onTestFinished(() => page.close())

  const title = page.getByRole('heading', { level: 1 })
  await expect(title.textContent()).resolves.toContain('Index Page')

  const paragraph = page.locator('#app-config')
  await expect(paragraph.textContent()).resolves.toContain('foo: bar')
})
