import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import {
  CjsPureDefault,
  CjsPureNamespace,
  CjsWrapperDefault,
  CjsWrapperNamespace,
} from '#components'

describe('mount cjs components', () => {
  it.each([
    CjsPureDefault,
    CjsPureNamespace,
    CjsWrapperDefault,
    CjsWrapperNamespace,
  ])('can mount $__name', async (Component) => {
    const wrapper = await mountSuspended(Component)
    expect(wrapper.text()).toBe('hello')
  })
})
