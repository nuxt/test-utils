import type { Environment } from 'vitest'
import { createFetch } from 'ofetch'
import { joinURL } from 'ufo'
import { createApp, defineEventHandler, toNodeListener } from 'h3'
import { createRouter as createRadixRouter, exportMatcher, toRouteMatcher } from 'radix3'
import { populateGlobal } from 'vitest/environments'
import {
  createCall,
  createFetch as createLocalFetch,
} from 'unenv/runtime/fetch/index'
import type { NuxtBuiltinEnvironment } from './types'
import happyDom from './env/happy-dom'
import jsdom from './env/jsdom'

export default <Environment>{
  name: 'nuxt',
  async setup(global, environmentOptions) {
    const url = joinURL(
      'http://localhost:3000',
      environmentOptions?.nuxtRuntimeConfig.app?.baseURL || '/'
    )
    const { window: win, teardown } = await {
      'happy-dom': happyDom,
      jsdom,
    }[
      (environmentOptions.nuxt.domEnvironment as NuxtBuiltinEnvironment) ||
        'happy-dom'
    ](global, {
      ...environmentOptions,
      happyDom: {
        url,
        ...environmentOptions?.happyDom,
      },
      jsdom: {
        url,
        ...environmentOptions?.jsdom,
      },
    })

    win.__NUXT__ = {
      serverRendered: false,
      config: {
        public: {},
        app: { baseURL: '/' },
        ...environmentOptions?.nuxtRuntimeConfig,
      },
      data: {},
      state: {},
    }

    const app = win.document.createElement('div')
    // this is a workaround for a happy-dom bug with ids beginning with _
    app.id = environmentOptions.nuxt.rootId
    win.document.body.appendChild(app)

    win.IntersectionObserver =
      win.IntersectionObserver ||
      class IntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      }

    const h3App = createApp()

    if (!win.fetch) {
      await import('node-fetch-native/polyfill')
      // @ts-expect-error URLSearchParams is not a proeprty of window
      win.URLSearchParams = globalThis.URLSearchParams
    }

    // @ts-expect-error TODO: fix in h3
    const localCall = createCall(toNodeListener(h3App))
    const localFetch = createLocalFetch(localCall, win.fetch)

    const registry = new Set<string>()

    win.fetch = (init: string, options?: any) => {
      if (typeof init === 'string') {
        const base = init.split('?')[0]
        if (registry.has(base) || registry.has(init)) {
          init = '/_' + init
        }
      }
      return localFetch(init, options)
    }

    win.$fetch = createFetch({ fetch: win.fetch, Headers: win.Headers })

    win.__registry = registry
    win.__app = h3App

    const { keys, originals } = populateGlobal(global, win, {
      bindFunctions: true,
    })

    // App manifest support
    const timestamp = Date.now()
    const routeRulesMatcher = toRouteMatcher(
      createRadixRouter({ routes: environmentOptions.nuxtRouteRules || {} })
    )
    const matcher = exportMatcher(routeRulesMatcher)
    h3App.use('/_/_nuxt/builds/latest.json', defineEventHandler(() => ({
      id: 'test',
      timestamp
    })))
    h3App.use('/_/_nuxt/builds/meta/test.json', defineEventHandler(() => ({
      id: 'test',
      timestamp,
      matcher,
      prerendered: []
    })))

    registry.add('/_nuxt/builds/latest.json')
    registry.add('/_nuxt/builds/meta/test.json')

    // @ts-ignore
    await import('#app/entry').then(r => r.default())

    return {
      // called after all tests with this env have been run
      teardown() {
        teardown()
        keys.forEach(key => delete global[key])
        originals.forEach((v, k) => (global[k] = v))
      },
    }
  },
}
