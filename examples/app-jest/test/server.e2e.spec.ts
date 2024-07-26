import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
})

describe('app', () => {
  it('runs a test', async () => {
    const html = await $fetch('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`"<!DOCTYPE html>"`)
  })
})
