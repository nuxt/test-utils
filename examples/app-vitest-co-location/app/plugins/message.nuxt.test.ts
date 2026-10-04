import { it, expect } from 'vitest'

it('plugin', () => {
  expect(useNuxtApp().$message()).toEqual('Hello Nuxt (/)')
})
