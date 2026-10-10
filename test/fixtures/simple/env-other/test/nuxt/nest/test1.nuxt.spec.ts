import { it, expect } from 'vitest'

it('nuxt/nest.nuxt', () => {
  expect(globalThis.window).toBeDefined()
  expect(globalThis.window).toHaveProperty('__NUXT_VITEST_ENVIRONMENT__', true)
})
