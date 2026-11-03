import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../../', import.meta.url)),
  browser: true,
})

it('should disable feature when building in tests', async () => {
  const page = await createPage('/')
  const text = await page.getByTestId('hello').textContent()
  expect(text).toContain('Hello Nuxt!')
  await page.close()
})
