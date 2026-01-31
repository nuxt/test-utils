import { expect, it } from 'vitest'

it('test2', () => {
  expect(globalThis.window).toBeUndefined()
})
