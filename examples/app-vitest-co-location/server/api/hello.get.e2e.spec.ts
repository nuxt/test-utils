import { fileURLToPath } from 'node:url'
import { it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../../', import.meta.url)),
})

it('runs e2e api test', { timeout: 20000 }, async () => {
  const res = await $fetch('/api/hello', { query: { name: 'Nuxt' } })
  expect(res).toMatchObject({ message: 'Hello Nuxt!' })
})
