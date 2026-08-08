import { describe, it, expect } from 'vitest'

import {
  useCjsPureDefault,
  useCjsPureNamespace,
  useCjsWrapperDefault,
  useCjsWrapperNamespace,
} from '#imports'

describe('use cjs composables manual', () => {
  it.each([
    useCjsPureDefault,
    useCjsPureNamespace,
    useCjsWrapperDefault,
    useCjsWrapperNamespace,
  ])('can use $0', async (fn) => {
    expect(fn()).toBe('hello')
  })
})
