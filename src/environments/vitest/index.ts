import type { Environment } from 'vitest'
import { createFetch } from 'ofetch'
import { indexedDB } from 'fake-indexeddb'
import { joinURL } from 'ufo'
import { createApp, defineEventHandler, toNodeListener } from 'h3'
import defu from 'defu'
import { createRouter as createRadixRouter, exportMatcher, toRouteMatcher } from 'radix3'
import { populateGlobal } from 'vitest/environments'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'

import type { NuxtBuiltinEnvironment } from './types'
import happyDom from './env/happy-dom'
import jsdom from './env/jsdom'

const environmentMap = {
  'happy-dom': happyDom,
  jsdom,
}

export default <Environment>{
  name: 'nuxt',
  transformMode: 'web',
  async setup(global, environmentOptions) {
    const url = joinURL('http://localhost:3000', environmentOptions?.nuxtRuntimeConfig.app?.baseURL || '/')

    const environmentName = environmentOptions.nuxt.domEnvironment as NuxtBuiltinEnvironment
    const environment = environmentMap[environmentName] || environmentMap['happy-dom']
    const { window: win, teardown } = await environment(global, defu(environmentOptions, {
      happyDom: { url },
      jsdom: { url },
    }))

    win.__NUXT_VITEST_ENVIRONMENT__ = true

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

    if (environmentOptions?.nuxt?.mock?.intersectionObserver) {
      win.IntersectionObserver
        = win.IntersectionObserver
        || class IntersectionObserver {
          observe() {}
          unobserve() {}
          disconnect() {}
        }
    }

    if (environmentOptions?.nuxt?.mock?.indexedDb) {
      // @ts-expect-error win.indexedDB is read-only
      win.indexedDB = indexedDB
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

    win.fetch = (init, options) => {
      if (typeof init === 'string') {
        const base = init.split('?')[0]
        if (registry.has(base) || registry.has(init)) {
          init = '/_' + init
        }
      }
      return localFetch(init.toString(), {
        ...options,
        headers: Array.isArray(options?.headers) ? new Headers(options?.headers) : options?.headers,
      })
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
      createRadixRouter({ routes: environmentOptions.nuxtRouteRules || {} }),
    )
    const matcher = exportMatcher(routeRulesMatcher)
    const manifestOutputPath = joinURL(
      '/',
      environmentOptions?.nuxtRuntimeConfig.app?.buildAssetsDir || '_nuxt',
      'builds',
    )
    const manifestBaseRoutePath = joinURL('/_', manifestOutputPath)

    h3App.use(
      `${manifestBaseRoutePath}/latest.json`,
      defineEventHandler(() => ({
        id: 'test',
        timestamp,
      })),
    )
    h3App.use(
      `${manifestBaseRoutePath}/meta/test.json`,
      defineEventHandler(() => ({
        id: 'test',
        timestamp,
        matcher,
        prerendered: [],
      })),
    )
    h3App.use(
      `${manifestBaseRoutePath}/meta/dev.json`,
      defineEventHandler(() => ({
        id: 'test',
        timestamp,
        matcher,
        prerendered: [],
      })),
    )

    registry.add(`${manifestOutputPath}/latest.json`)
    registry.add(`${manifestOutputPath}/meta/test.json`)
    registry.add(`${manifestOutputPath}/meta/dev.json`)

    return {
      // called after all tests with this env have been run
      teardown() {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        keys.forEach(key => delete global[key])
        originals.forEach((v, k) => (global[k] = v))
        teardown()
      },
    }
  },
}
