import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  dev: true,
})

describe('server (dev)', async () => {
  it('runs a test', async () => {
    const html = await $fetch('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`
      "<!DOCTYPE html>"
    `)
  })
})
