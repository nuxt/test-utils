import { describe, expect, it } from 'vitest'
import type { Nuxt, ViteConfig } from '@nuxt/schema'

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
})
