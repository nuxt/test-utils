import { it, describe, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const {
  increment,
} = vi.hoisted(() => ({
  increment: vi.fn(),
}))

mockNuxtImport(useGlobalCounter, () => () => ({
  count: ref(0),
  increment,
}))

describe('global middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
    useGlobalCounter().count.value = 0
  })

  it('can mock composable inside global middleware', async () => {
    await navigateTo({ path: '/', force: true })
    expect(increment).toHaveBeenCalledOnce()
    expect(useGlobalCounter().count.value).toBe(0)
  })
})
