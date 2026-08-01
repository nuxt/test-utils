import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useAutoImportedTarget', (original) => {
  return () => `useAutoImportedTarget mocked(${original()})`
})

mockNuxtImport<typeof useDefaultExport>('useDefaultExport', (original) => {
  return () => `useDefaultExport mocked(${original()})`
})

mockNuxtImport(useRuntimeConfig, (original) => {
  return (...args) => {
    const value = original(...args)
    return {
      ...value,
      public: {
        ...value.public,
        API_ENTRYPOINT: 'http://api.example.com',
      },
    }
  }
})

mockNuxtImport(useRouter, (original) => {
  return () => {
    const value = original()
    return {
      ...value,
      replace: vi.fn(value.replace),
    }
  }
})

describe('mock with original composables', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('should mock composables from project', () => {
    expect(useAutoImportedTarget()).toBe('useAutoImportedTarget mocked(the original)')
  })

  it('should mock composable with default export', () => {
    expect(useDefaultExport()).toBe('useDefaultExport mocked(the original)')
  })

  it('should extend original composable return value', () => {
    expect(useRuntimeConfig()).toMatchObject({
      app: {
        baseURL: '/',
        buildAssetsDir: '/_nuxt/',
        buildId: 'test',
      },
      nitro: {
        envPrefix: 'NUXT_',
      },
      public: {
        API_ENTRYPOINT: 'http://api.example.com',
        hello: 'world',
        testValue: 123,
      },
    })
  })

  it('should be able to partially mock the original', async () => {
    const router = useRouter()
    expect(router.currentRoute.value.path).toBe('/')

    await router.replace('/test1')
    expect(router.currentRoute.value.path).toBe('/test1')
    expect(vi.mocked(router.replace)).toHaveBeenLastCalledWith('/test1')

    vi.mocked(router.replace).mockImplementationOnce(() => Promise.resolve())
    await router.replace('/test2')
    expect(router.currentRoute.value.path).toBe('/test1')
    expect(vi.mocked(router.replace)).toHaveBeenLastCalledWith('/test2')
  })
})
