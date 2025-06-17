import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: resolve('../', import.meta.dirname),
  server: true,
})

describe('app', async () => {
  it('runs a test', async () => {
    const html = await $fetch('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`
      "<!DOCTYPE html>"
    `)
  })
})
