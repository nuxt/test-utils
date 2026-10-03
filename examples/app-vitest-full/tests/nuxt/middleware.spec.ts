import { it, describe, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport, runRouteMiddleware } from '@nuxt/test-utils/runtime'
import type { RouteMiddleware } from 'nuxt/app'

import counterMiddleware from '~/middleware/01.global-counter.global'

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
    expect(incrementMock).not.toHaveBeenCalled()

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

  it('can run a route middleware without navigating', async () => {
    const route = useRoute()
    const currentPath = route.fullPath

    incrementMock.mockImplementation(() => 1000)

    const result = await runRouteMiddleware(counterMiddleware, {
      to: '/',
      from: route,
    })

    expect(result).toBe('/count/just/1000')
    expect(route.fullPath).toBe(currentPath)
    expect(incrementMock).toHaveBeenCalledOnce()
  })

  it('normalizes the to and from routes', async () => {
    let routes: Parameters<RouteMiddleware> | undefined
    const middleware = defineNuxtRouteMiddleware((...args) => {
      routes = args
    })

    await runRouteMiddleware(middleware, {
      to: '/other/example?tab=settings',
      from: '/about',
    })

    expect(routes?.[0]).toMatchObject({
      path: '/other/example',
      fullPath: '/other/example?tab=settings',
      params: { slug: 'example' },
      query: { tab: 'settings' },
    })
    expect(routes?.[1]).toMatchObject({
      path: '/about',
      fullPath: '/about',
    })
  })

  it('supports aborting navigation', async () => {
    const middleware = defineNuxtRouteMiddleware(() => abortNavigation())

    await expect(runRouteMiddleware(middleware, { to: '/about' })).resolves.toBe(false)
  })

  it('restores the middleware context when middleware throws', async () => {
    const nuxtApp = useNuxtApp()
    const middleware = defineNuxtRouteMiddleware(() => {
      return abortNavigation({ statusCode: 403, statusMessage: 'Forbidden' })
    })

    await expect(runRouteMiddleware(middleware, { to: '/about' })).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
    expect(nuxtApp._processingMiddleware).toBeUndefined()
  })
})
