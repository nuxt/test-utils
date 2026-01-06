import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { incrementMock } = vi.hoisted(() => ({
  incrementMock: vi.fn(() => 100),
}))

mockNuxtImport(useGlobalCounter, () => () => ({
  count: ref(100),
  increment: incrementMock,
}))

describe('plugins', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('can access injections', () => {
    const app = useNuxtApp()
    expect(app.$auth.didInject).toMatchInlineSnapshot('true')
    expect(app.$router).toBeDefined()
  })

  it('can mock composable inside plugin', () => {
    const { count, increment } = useNuxtApp().$counter

    expect(count.value).toBe(100)
    expect(incrementMock).not.toBeCalled()

    expect(increment()).toBe(100)

    expect(count.value).toBe(100)
    expect(incrementMock).toHaveBeenCalledOnce()
  })
})
