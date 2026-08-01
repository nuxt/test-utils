import { it, expect } from 'vitest'

it('test2', () => {
  expect(globalThis.window).toBeUndefined()
})
