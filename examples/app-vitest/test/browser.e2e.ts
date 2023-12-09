import { fileURLToPath } from 'node:url'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  browser: true,
})

describe('browser', async () => {
  it('runs a test', async () => {
    const page = await createPage('/') 
    expect(page.getByRole('heading').innerText()).toContain('Welcome to Nuxt!')
  })
})
