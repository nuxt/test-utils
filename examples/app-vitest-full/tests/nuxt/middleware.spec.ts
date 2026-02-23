import { it, describe, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const {
  incrementMock,
} = vi.hoisted(() => ({
  incrementMock: vi.fn(),
}))

mockNuxtImport(useGlobalCounter, () => () => ({
  count: ref(100),
  increment: incrementMock,
}))

mockNuxtImport('navigateTo', original => vi.fn(original))

describe('middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('can mock composable inside global middleware', async () => {
    const { count } = useGlobalCounter()
    expect(incrementMock).not.toBeCalled()

    await navigateTo({ path: '/', force: true })

    expect(count.value).toBe(100)
    expect(incrementMock).toHaveBeenCalledOnce()
  })

  it('can use original nuxt core composable inside middleware', async () => {
    const route = useRoute()

    incrementMock.mockImplementation(() => 1000)

    await navigateTo({ path: '/', force: true })

    expect(route.path).toBe('/count/just/1000')
    expect(incrementMock).toHaveBeenCalledOnce()
  })

  it('can mock nuxt core composable inside middleware', async () => {
    const route = useRoute()

    const navigateToMock = vi.mocked(navigateTo)
    const navigateToOriginal = navigateToMock.getMockImplementation()!

    navigateToMock.mockImplementation(() => Promise.resolve())
    incrementMock.mockImplementation(() => 1000)

    await navigateToOriginal({ path: '/', force: true })

    expect(route.path).toBe('/')
    expect(incrementMock).toHaveBeenCalledOnce()
    expect(navigateToMock).toHaveBeenLastCalledWith('/count/just/1000')
  })
})
