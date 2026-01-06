import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { useRoute as useVueRoute } from 'vue-router'

import Index from '~/pages/router/route.vue'

vi.mock(import('vue-router'), async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    useRoute: vi.fn(original.useRoute),
  }
})

mockNuxtImport<typeof useRoute>('useRoute', original => vi.fn(original))

describe('Index', async () => {
  const useRouteMock = vi.mocked(useRoute)
  const useVueRouteMock = vi.mocked(useVueRoute)

  const useRouteOriginal = useRouteMock.getMockImplementation()!
  const useVueRouteOriginal = useVueRouteMock.getMockImplementation()!

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should render correctly', async () => {
    useRouteMock.mockImplementation((...args) => ({
      ...useRouteOriginal(...args),
      path: '/bob',
    }))

    useVueRouteMock.mockImplementation((...args) => ({
      ...useVueRouteOriginal(...args),
      path: '/123',
    }))

    expect(useRouteMock).not.toBeCalled()
    expect(useVueRouteMock).not.toBeCalled()

    const wrapper = await mountSuspended(Index)
    expect(wrapper.html()).toMatchSnapshot()

    expect(useRouteMock).toBeCalled()
    expect(useVueRouteMock).toBeCalled()
  })
})
