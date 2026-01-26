import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe.todo('app', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../', import.meta.url)),
  })
  it('runs a test', async () => {
    const html = await $fetch<string>('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`
      "<!DOCTYPE html>"
    `)
  })
})
