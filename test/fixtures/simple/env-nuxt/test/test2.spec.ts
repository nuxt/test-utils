// @vitest-environment node
import { it, expect } from 'vitest'

it('test2.nuxt', () => {
  expect(globalThis.window).toBeUndefined()
})
