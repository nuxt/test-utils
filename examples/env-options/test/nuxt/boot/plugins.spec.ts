import { it, describe, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

import { INJECTED_VALUE } from '~/plugins/injected-value'

import InjectedValue from '~/components/InjectedValue.vue'

const { increment } = vi.hoisted(() => ({
  increment: vi.fn(),
}))

mockNuxtImport(useGlobalCounter, () => () => ({
  count: ref(0),
  increment,
}))

describe('plugins', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
    useGlobalCounter().count.value = 0
  })

  it('can mock composable inside plugin', async () => {
    useNuxtApp().$counter.increment()
    expect(increment).toHaveBeenCalledOnce()
    expect(useGlobalCounter().count.value).toBe(0)
  })

  it('export `Symbol()` without global registry does match', async () => {
    const wrapper = await mountSuspended(InjectedValue)
    expect(wrapper.text()).toBe(INJECTED_VALUE)
  })
})
