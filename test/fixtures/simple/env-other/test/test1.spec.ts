import { expect, it } from 'vitest'

it('test1', () => {
  expect(globalThis.window).toBeUndefined()
})
