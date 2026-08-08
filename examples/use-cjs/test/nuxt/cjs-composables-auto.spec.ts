import { describe, it, expect } from 'vitest'

describe('use cjs composables with auto import', () => {
  it.each([
    useCjsPureDefault,
    useCjsPureNamespace,
    useCjsWrapperDefault,
    useCjsWrapperNamespace,
  ])('can use $0', async (fn) => {
    expect(fn()).toBe('hello')
  })
})
