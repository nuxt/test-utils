import { resolve } from 'node:path'
import { describe, it, expect } from 'bun:test'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: resolve('../', import.meta.dirname),
  server: true,
})

describe('app', () => {
  it('runs a test', async () => {
    const html = await $fetch('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`"<!DOCTYPE html>"`)
  })
})
