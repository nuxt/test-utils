// @vitest-environment nuxt
import { it, expect } from 'vitest'

it('test3', () => {
  expect(globalThis.window).toBeDefined()
  expect(globalThis.window).toHaveProperty('__NUXT_VITEST_ENVIRONMENT__', true)
})
