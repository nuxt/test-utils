import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup, startServer } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/dot-config', import.meta.url)),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>dot-config <span>original value</span></div>')
  })

  it('changes runtime config and restarts', { timeout: 120000 }, async () => {
    await startServer({ env: { NUXT_PUBLIC_MY_VALUE: 'overwritten by test!' } })

    const html = await $fetch('/')
    expect(html).toContain('<div>dot-config <span>overwritten by test!</span></div>')

    await startServer()
    const htmlRestored = await $fetch('/')
    expect(htmlRestored).toContain('<div>dot-config <span>original value</span></div>')
  })
})
