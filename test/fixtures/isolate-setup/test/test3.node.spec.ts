// @vitest-environment node
import { expect, test } from 'vitest'

test('test3', () => {
  expect(typeof window === 'undefined').toBe(true)
})
