import { describe, expect, it } from 'vitest'
import type { Nuxt, NuxtConfig, ViteConfig } from '@nuxt/schema'
import type { Plugin } from 'vite'

import { getVitestConfigFromNuxt } from '../../src/config.ts'
import { deepCopy } from '../../src/utils.ts'

describe('deepCopy', () => {
  it('should copy through proxies', () => {
    const source = new Proxy({ nested: new Proxy({ a: 1 }, {}) }, {})
    const copy = deepCopy(source)
    expect(copy).toEqual({ nested: { a: 1 } })
    copy.nested.a = 2
    expect(source.nested.a).toBe(1)
  })

  it('should preserve functions and class instances by reference', () => {
    const fn = () => 'hi'
    const date = new Date(0)
    const copy = deepCopy({ fn, date, list: [fn] })
    expect(copy.fn).toBe(fn)
    expect(copy.date).toBe(date)
    expect(copy.list[0]).toBe(fn)
  })

  it('should handle circular references', () => {
    const source: Record<string, unknown> = { a: 1 }
    source.self = source
    const copy = deepCopy(source)
    expect(copy.self).toBe(copy)
  })
})

describe('getVitestConfigFromNuxt', () => {
  it('should resolve a runtimeConfig containing a proxy', async () => {
    const nuxt = {
      options: {
        appDir: process.cwd(),
        modulesDir: [process.cwd()],
        rootDir: process.cwd(),
        _layers: [],
        runtimeConfig: {
          public: new Proxy({ debug: { hydration: true } }, {}),
        },
        routeRules: {},
        app: {},
        build: { transpile: [] },
      },
    } as unknown as Nuxt

    const config = await getVitestConfigFromNuxt({
      nuxt,
      viteConfig: { plugins: [] } as unknown as ViteConfig,
    })

    expect(config.test.environmentOptions!.nuxtRuntimeConfig).toEqual({
      public: { debug: { hydration: true } },
    })
  })

  it('should disable dependency discovery in browser mode unless set in the nuxt config', async () => {
    const nuxt = {
      options: {
        appDir: process.cwd(),
        modulesDir: [process.cwd()],
        rootDir: process.cwd(),
        _layers: [],
        runtimeConfig: {},
        routeRules: {},
        app: {},
        build: { transpile: [] },
      },
    } as unknown as Nuxt
    const userConfig = { test: { browser: { enabled: true } } }

    const config = await getVitestConfigFromNuxt({
      nuxt,
      viteConfig: { plugins: [] } as unknown as ViteConfig,
    }, {}, userConfig)
    expect(config.optimizeDeps!.noDiscovery).toBe(true)

    const configWithDiscovery = await getVitestConfigFromNuxt({
      nuxt,
      viteConfig: { plugins: [], optimizeDeps: { noDiscovery: false } } as unknown as ViteConfig,
    }, {}, userConfig)
    expect(configWithDiscovery.optimizeDeps!.noDiscovery).toBe(false)
  })

  it('should derive the module cache key from the nuxt config without runtimeConfig or appConfig', async () => {
    async function getCacheKey(layerConfig: NuxtConfig, overrides?: NuxtConfig) {
      const nuxt = {
        options: {
          appDir: process.cwd(),
          modulesDir: [process.cwd()],
          rootDir: process.cwd(),
          _layers: [{ cwd: process.cwd(), config: layerConfig }],
          runtimeConfig: {},
          routeRules: {},
          app: {},
          build: { transpile: [] },
        },
      } as unknown as Nuxt
      const config = await getVitestConfigFromNuxt({
        nuxt,
        viteConfig: { plugins: [] } as unknown as ViteConfig,
      }, { overrides })
      const plugin = (config.plugins as Plugin[]).find(p => p.name === 'nuxt:test-utils:cache-key')!
      let generator: (() => string) | undefined
      ;(plugin.configureVitest as (context: unknown) => void)({
        experimental_defineCacheKeyGenerator: (fn: () => string) => {
          generator = fn
        },
      })
      return generator!()
    }

    const key = await getCacheKey({ ssr: false })
    expect(await getCacheKey({ ssr: false })).toBe(key)
    expect(await getCacheKey({ ssr: false, runtimeConfig: { secret: 'changed' } })).toBe(key)
    expect(await getCacheKey({ ssr: false, appConfig: { builtAt: Date.now() } })).toBe(key)
    expect(await getCacheKey({ ssr: true })).not.toBe(key)
    expect(await getCacheKey({ ssr: false }, { runtimeConfig: { secret: 'changed' }, appConfig: { builtAt: Date.now() } })).toBe(key)
    expect(await getCacheKey({ ssr: false }, { ssr: true })).not.toBe(key)
    expect(await getCacheKey({ vite: { define: { a: '1', b: '2' } } })).toBe(await getCacheKey({ vite: { define: { b: '2', a: '1' } } }))

    const circular: Record<string, unknown> = { a: 1 }
    circular.self = circular
    expect(await getCacheKey({ vite: { define: circular } })).toBe(await getCacheKey({ vite: { define: circular } }))

    expect(await getCacheKey({ modules: [() => {}] })).not.toBe(await getCacheKey({ modules: [() => ({})] }))
    expect(await getCacheKey({ vite: { define: { re: /a/ } } })).not.toBe(await getCacheKey({ vite: { define: { re: /b/ } } }))
    expect(await getCacheKey({ vite: { define: { map: new Map([['a', 1]]) } } })).not.toBe(await getCacheKey({ vite: { define: { map: new Map([['a', 2]]) } } }))
    expect(await getCacheKey({ vite: { define: { set: new Set([1]) } } })).not.toBe(await getCacheKey({ vite: { define: { set: new Set([2]) } } }))
  })
})
