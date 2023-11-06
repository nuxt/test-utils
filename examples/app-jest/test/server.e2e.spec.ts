import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

// await setup({
//   rootDir: fileURLToPath(new URL('../', import.meta.url)),
//   runner: 'jest'
// })
describe('app', async () => {
  it('runs a test', async () => {
    expect(true).toBe(true)
    // const html = await $fetch('/')
    // expect(html.slice(0, 15)).toMatchInlineSnapshot(`
    //   "<!DOCTYPE html>"
    // `)
  })
})
