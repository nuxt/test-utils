import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { setRuntimeConfig } from '@nuxt/test-utils/module-utils'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('<div>basic <span>original value</span></div>')
  })


  it('changes runtime config and restarts', async () => {
    const restoreConfig = await setRuntimeConfig({ public: { myValue: 'overwritten by test!' } })
    
    const html = await $fetch('/')
    expect(html).toContain('<div>basic <span>overwritten by test!</span></div>')

    await restoreConfig()
    const htmlRestored = await $fetch('/')
    expect(htmlRestored).toContain('<div>basic <span>original value</span></div>')
  })
})
