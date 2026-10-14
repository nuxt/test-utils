import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

for (const fixture of ['basic', 'dot-config']) {
  describe(fixture, async () => {
    await setup({
      rootDir: fileURLToPath(new URL(`./fixtures/${fixture}`, import.meta.url)),
    })

    it('renders the index page', async () => {
      const html = await $fetch('/')
      expect(html).toContain(`<div>${fixture} <span>original value</span></div>`)
    })
  })
}
