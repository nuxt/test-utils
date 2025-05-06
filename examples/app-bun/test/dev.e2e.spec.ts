import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'bun:test'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  dev: true,
})

describe('server (dev)', () => {
  it('runs a test', async () => {
    const html = await $fetch('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`"<!DOCTYPE html>"`)
  })
})
