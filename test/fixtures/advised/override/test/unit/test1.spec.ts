import { it, expect } from 'vitest'

it('unit/test1', () => {
  expect(globalThis.window).toBeUndefined()
})
