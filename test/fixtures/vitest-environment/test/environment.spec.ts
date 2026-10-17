import { expect, it } from 'vitest'

it('runs in the nuxt environment', () => {
  expect(window.__NUXT_VITEST_ENVIRONMENT__).toBe(true)
})
