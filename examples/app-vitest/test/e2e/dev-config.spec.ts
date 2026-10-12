import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../../', import.meta.url)),
  dev: true,
  nuxtConfig: {
    ssr: false,
    app: { head: { title: 'Overridden in dev' } },
  },
})

describe('server (dev) with nuxtConfig overrides', () => {
  it('applies the overrides to the dev server', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('<title>Overridden in dev</title>')
    expect(html).not.toContain('My title')
  })
})
