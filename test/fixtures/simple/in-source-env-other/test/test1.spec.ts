import { it, expect } from 'vitest'

it('test1', () => {
  expect(globalThis.window).toBeUndefined()
})
