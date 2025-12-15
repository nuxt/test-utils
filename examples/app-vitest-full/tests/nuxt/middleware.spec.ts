// @vitest-environment-options { "startOn": "beforeAll" }
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'

const {
  useInsideGlobalMiddlewareMock,
  useInsideNamedMiddlewareMock,
} = vi.hoisted(() => ({
  useInsideGlobalMiddlewareMock: vi.fn<typeof useInsideGlobalMiddleware>(),
  useInsideNamedMiddlewareMock: vi.fn<typeof useInsideNamedMiddleware>(),
}))

mockNuxtImport(useInsideGlobalMiddleware, () => useInsideGlobalMiddlewareMock)
mockNuxtImport(useInsideNamedMiddleware, () => useInsideNamedMiddlewareMock)

describe('middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('global middleware', () => {
    describe('when mock returns value navigation fails', () => {
      beforeEach(() => {
        useInsideGlobalMiddlewareMock.mockImplementation(() => ({
          statusCode: 401,
          message: 'mock return error',
        }))
      })

      it('navigateTo', async () => {
        await expect(
          navigateTo({ path: '/foo', force: true }),
        ).rejects.toMatchObject(
          { statusCode: 401, message: 'mock return error' },
        )
        expect(useRoute().path).toBe('/')
        expect(useInsideGlobalMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('mountSuspended', async () => {
        await expect(
          mountSuspended(App, { route: { path: '/foo', force: true } }),
        ).rejects.toMatchObject(
          { statusCode: 401, message: 'mock return error' },
        )
        expect(useRoute().path).toBe('/')
        expect(useInsideGlobalMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('renderSuspended', async () => {
        await expect(
          renderSuspended(App, { route: { path: '/foo', force: true } }),
        ).rejects.toMatchObject(
          { statusCode: 401, message: 'mock return error' },
        )
        expect(useRoute().path).toBe('/')
        expect(useInsideGlobalMiddlewareMock).toHaveBeenCalledOnce()
      })
    })

    describe('when mock returns undefined inside navigation succeeds', () => {
      beforeEach(async () => {
        useInsideGlobalMiddlewareMock.mockImplementation(() => undefined)
      })

      it('navigateTo', async () => {
        await navigateTo({ path: '/foo', force: true })
        await nextTick()
        expect(useRoute().path).toBe('/foo')
        expect(useInsideGlobalMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('mountSuspended', async () => {
        const wrapper = await mountSuspended(App, {
          route: { path: '/foo', force: true },
        })
        expect(wrapper.html()).toContain('<div>/foo</div>')
        expect(useInsideGlobalMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('renderSuspended', async () => {
        const wrapper = await renderSuspended(App, {
          route: { path: '/foo', force: true },
        })
        expect(wrapper.html()).toContain('<div>/foo</div>')
        expect(useInsideGlobalMiddlewareMock).toHaveBeenCalledOnce()
      })
    })
  })

  describe('named middleware', () => {
    describe('when mock returns value navigation fails', () => {
      beforeEach(() => {
        useInsideNamedMiddlewareMock.mockImplementation(() => ({
          statusCode: 401,
          message: 'mock return error',
        }))
      })

      it('navigateTo', async () => {
        await expect(
          navigateTo({ path: '/other/named-middleware', force: true }),
        ).rejects.toMatchObject(
          { statusCode: 401, message: 'mock return error' },
        )
        expect(useInsideNamedMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('mountSuspended', async () => {
        await expect(
          mountSuspended(App, {
            route: { path: '/other/named-middleware', force: true },
          }),
        ).rejects.toMatchObject(
          { statusCode: 401, message: 'mock return error' },
        )
        expect(useInsideNamedMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('renderSuspended', async () => {
        await expect(
          renderSuspended(App, {
            route: { path: '/other/named-middleware', force: true },
          }),
        ).rejects.toMatchObject(
          { statusCode: 401, message: 'mock return error' },
        )
        expect(useInsideNamedMiddlewareMock).toHaveBeenCalledOnce()
      })
    })

    describe('when mock returns undefined navigation succeeds', () => {
      beforeEach(async () => {
        useInsideNamedMiddlewareMock.mockImplementation(() => undefined)
      })

      it('navigateTo', async () => {
        await navigateTo({ path: '/other/named-middleware', force: true })
        await nextTick()
        expect(useRoute().path).toBe('/other/named-middleware')
        expect(useInsideNamedMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('mountSuspended', async () => {
        const wrapper = await mountSuspended(App, {
          route: { path: '/other/named-middleware', force: true },
        })
        expect(wrapper.html()).toContain('<div>named-middleware</div>')
        expect(useInsideNamedMiddlewareMock).toHaveBeenCalledOnce()
      })

      it('renderSuspended', async () => {
        const wrapper = await renderSuspended(App, {
          route: { path: '/other/named-middleware', force: true },
        })
        expect(wrapper.html()).toContain('<div>named-middleware</div>')
        expect(useInsideNamedMiddlewareMock).toHaveBeenCalledOnce()
      })
    })
  })
})
