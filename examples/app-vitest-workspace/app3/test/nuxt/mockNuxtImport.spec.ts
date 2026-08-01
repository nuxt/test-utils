import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'

import { ref, useCounter } from '#imports'
import { Counter } from '#components'

mockNuxtImport(useCounter, original => vi.fn(original))

describe('mockNuxtImport', () => {
  enableAutoUnmount(afterEach)

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should mock composable', () => {
    vi.mocked(useCounter).mockImplementationOnce(() => ({
      count: ref(100),
      increment: vi.fn(),
    }))

    const { count, increment } = useCounter()
    expect(count.value).toBe(100)

    increment()
    expect(vi.mocked(increment)).toHaveBeenCalled()
  })

  it('sould mock composable used by component', async () => {
    const increment = vi.fn()

    vi.mocked(useCounter).mockImplementationOnce(() => ({
      count: ref(100),
      increment,
    }))

    const wrapper = await mountSuspended(Counter)
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('100')

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    await button.trigger('click')
    expect(input.element.value).toBe('100')
    expect(increment).toHaveBeenCalled()
  })
})
