import type { Environment } from 'vitest/environments'
import { createFetch } from 'ofetch'
import { indexedDB } from 'fake-indexeddb'
import { joinURL } from 'ufo'
import { createApp, defineEventHandler, toNodeListener, splitCookiesString } from 'h3'
import defu from 'defu'
import { createRouter as createRadixRouter, exportMatcher, toRouteMatcher } from 'radix3'
import { populateGlobal } from 'vitest/environments'
import { fetchNodeRequestHandler } from 'node-mock-http'

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
    const url = joinURL(environmentOptions?.nuxt.url ?? 'http://localhost:3000',
      environmentOptions?.nuxtRuntimeConfig.app?.baseURL || '/',
    )

    const consoleInfo = console.info
    console.info = (...args) => {
      if (args[0] === '<Suspense> is an experimental feature and its API will likely change.') {
        return
      }
      return consoleInfo(...args)
    }

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

    const nodeHandler = toNodeListener(h3App)

    const registry = new Set<string>()

    win.fetch = async (url, init) => {
      if (typeof url === 'string') {
        const base = url.split('?')[0]
        if (registry.has(base) || registry.has(url)) {
          url = '/_' + url
        }
        if (url.startsWith('/')) {
          const response = await fetchNodeRequestHandler(nodeHandler, url, init)
          return normalizeFetchResponse(response)
        }
      }
      return fetch(url, init)
    }

    // @ts-expect-error fetch types differ slightly
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

    // @ts-expect-error untyped __NUXT__ variable
    const buildId = win.__NUXT__.config.app.buildId || 'test'

    h3App.use(
      `${manifestBaseRoutePath}/latest.json`,
      defineEventHandler(() => ({
        id: buildId,
        timestamp,
      })),
    )
    h3App.use(
      `${manifestBaseRoutePath}/meta/${buildId}.json`,
      defineEventHandler(() => ({
        id: buildId,
        timestamp,
        matcher,
        prerendered: [],
      })),
    )

    registry.add(`${manifestOutputPath}/latest.json`)
    registry.add(`${manifestOutputPath}/meta/${buildId}.json`)

    return {
      // called after all tests with this env have been run
      teardown() {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        keys.forEach(key => delete global[key])
        console.info = consoleInfo
        originals.forEach((v, k) => (global[k] = v))
        teardown()
      },
    }
  },
}

/** utils from nitro */

function normalizeFetchResponse(response: Response) {
  if (!response.headers.has('set-cookie')) {
    return response
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers),
  })
}

function normalizeCookieHeader(header: number | string | string[] = '') {
  return splitCookiesString(joinHeaders(header))
}

function normalizeCookieHeaders(headers: Headers) {
  const outgoingHeaders = new Headers()
  for (const [name, header] of headers) {
    if (name === 'set-cookie') {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append('set-cookie', cookie)
      }
    }
    else {
      outgoingHeaders.set(name, joinHeaders(header))
    }
  }
  return outgoingHeaders
}

function joinHeaders(value: number | string | string[]) {
  return Array.isArray(value) ? value.join(', ') : String(value)
}
