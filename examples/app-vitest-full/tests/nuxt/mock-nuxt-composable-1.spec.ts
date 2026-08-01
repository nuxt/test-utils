import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enableAutoUnmount } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

import Component from '~/components/WithNuxtCoreComposables.vue'

mockNuxtImport(tryUseNuxtApp, original => vi.fn(original))
mockNuxtImport(useNuxtApp, original => vi.fn(original))
mockNuxtImport(useRuntimeConfig, original => vi.fn(original))
mockNuxtImport(useRoute, original => vi.fn(original))
mockNuxtImport(useRouter, original => vi.fn(original))
mockNuxtImport(navigateTo, original => vi.fn(original))

describe('mock core nuxt composables', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  enableAutoUnmount(afterEach)

  describe('tryUseNuxtApp', () => {
    it('should mock', async () => {
      vi.spyOn(tryUseNuxtApp()!, 'callHook').mockImplementation(async () => 'mocked')
      vi.mocked(tryUseNuxtApp).mockClear()

      expect(tryUseNuxtApp).not.toHaveBeenCalled()
      const nuxtApp = tryUseNuxtApp()!
      expect(tryUseNuxtApp).toHaveBeenCalled()

      expect(await nuxtApp.callHook('page:finish', null!)).toBe('mocked')
      expect(nuxtApp.callHook).toHaveBeenLastCalledWith('page:finish', null!)
    })

    it('should mock inside component', async () => {
      vi.spyOn(tryUseNuxtApp()!, 'callHook').mockImplementation(async () => 'mocked')
      vi.mocked(tryUseNuxtApp).mockClear()

      expect(tryUseNuxtApp).not.toHaveBeenCalled()
      const wrapper = await mountSuspended(Component, { props: { callHook: 'page:finish' } })
      expect(tryUseNuxtApp).toHaveBeenCalled()

      await wrapper.find('#tryUseNuxtApp-callHook').trigger('click')
      expect(tryUseNuxtApp()!.callHook).toHaveBeenLastCalledWith('page:finish')
    })
  })

  describe('useNuxtApp', () => {
    it('should mock', async () => {
      vi.spyOn(useNuxtApp(), 'callHook').mockImplementation(async () => 'mocked')
      vi.mocked(useNuxtApp).mockClear()

      expect(useNuxtApp).not.toHaveBeenCalled()
      const nuxtApp = useNuxtApp()
      expect(useNuxtApp).toHaveBeenCalledOnce()

      expect(await nuxtApp.callHook('page:finish', null!)).toBe('mocked')
      expect(nuxtApp.callHook).toHaveBeenLastCalledWith('page:finish', null!)
    })

    it('should mock inside component', async () => {
      vi.spyOn(useNuxtApp(), 'callHook').mockImplementation(async () => 'mocked')
      vi.mocked(useNuxtApp).mockClear()

      expect(useNuxtApp).not.toHaveBeenCalled()
      const wrapper = await mountSuspended(Component, { props: { callHook: 'page:finish' } })
      expect(useNuxtApp).toHaveBeenCalled()

      await wrapper.find('#useNuxtApp-callHook').trigger('click')
      expect(useNuxtApp().callHook).toHaveBeenLastCalledWith('page:finish')
    })
  })

  describe('useRuntimeConfig', () => {
    beforeEach(() => {
      const config = useRuntimeConfig()
      vi.spyOn(config, 'public', 'get').mockReturnValue({ ...config.public, API_ENTRYPOINT: 'http://api.example.com' })
      vi.mocked(useRuntimeConfig).mockClear()
    })

    it('should mock', () => {
      expect(useRuntimeConfig).not.toHaveBeenCalled()
      const config = useRuntimeConfig()
      expect(useRuntimeConfig).toHaveBeenCalled()

      expect(config.public.API_ENTRYPOINT).toBe('http://api.example.com')
    })

    it('should mock inside component', async () => {
      expect(useRuntimeConfig).not.toHaveBeenCalled()
      const wrapper = await mountSuspended(Component)
      expect(useRuntimeConfig).toHaveBeenCalled()

      expect(wrapper.find('#useRuntimeConfig-public-API_ENTRYPOINT').text()).toBe('http://api.example.com')
    })
  })

  describe('useRoute', () => {
    it('should mock', async () => {
      const useRouteMock = vi.mocked(useRoute)
      const useRouteOriginal = useRouteMock.getMockImplementation()!
      useRouteMock.mockImplementation(
        (...args) => ({ ...useRouteOriginal(...args), path: '/mocked' }),
      )

      expect(useRoute).not.toHaveBeenCalled()
      const route = useRoute()
      expect(useRoute).toHaveBeenCalled()

      expect(route.path).toBe('/mocked')
    })

    it('should mock inside component', async () => {
      const useRouteMock = vi.mocked(useRoute)
      const useRouteOriginal = useRouteMock.getMockImplementation()!
      useRouteMock.mockImplementation(
        (...args) => ({ ...useRouteOriginal(...args), path: '/mocked' }),
      )

      expect(useRoute).not.toHaveBeenCalled()
      const wrapper = await mountSuspended(Component)
      expect(useRoute).toHaveBeenCalled()

      expect(wrapper.find('#useRoute-path').text()).toBe('/mocked')
    })
  })

  describe('useRouter', () => {
    it('should mock', async () => {
      vi.spyOn(useRouter(), 'push').mockImplementation(async () => {})
      vi.mocked(useRouter).mockClear()

      expect(useRouter).not.toHaveBeenCalled()
      const router = useRouter()
      expect(useRouter).toHaveBeenCalled()

      await router.push('/mocked')
      expect(router.push).toHaveBeenLastCalledWith('/mocked')
    })

    it('should mock inside component', async () => {
      vi.spyOn(useRouter(), 'push').mockImplementation(async () => {})
      vi.mocked(useRouter).mockClear()

      expect(useRouter).not.toHaveBeenCalled()
      const wrapper = await mountSuspended(Component, { props: { pushPath: '/mocked' } })
      expect(useRouter).toHaveBeenCalled()

      await wrapper.find('#useRouter-push').trigger('click')
      expect(useRouter().push).toHaveBeenLastCalledWith('/mocked')
    })
  })

  describe('navigateTo', () => {
    it('should mock', async () => {
      vi.mocked(navigateTo).mockImplementation(async () => {})
      await navigateTo('/mocked')
      expect(navigateTo).toHaveBeenLastCalledWith('/mocked')
    })

    it('should mock inside component', async () => {
      vi.mocked(navigateTo).mockImplementation(async () => {})
      const wrapper = await mountSuspended(Component, { props: { pushPath: '/mocked' } })
      await wrapper.find('#navigateTo').trigger('click')
      expect(navigateTo).toHaveBeenLastCalledWith('/mocked')
    })
  })
})
