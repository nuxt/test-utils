import { createFetch } from 'ofetch'
import { joinURL } from 'ufo'
import { createApp, defineEventHandler, toNodeListener } from 'h3'
import { createRouter as createRadixRouter, exportMatcher, toRouteMatcher } from 'radix3'
import { fetchNodeRequestHandler } from 'node-mock-http'
import type { NuxtWindow } from '../../vitest-environment'
import type { NuxtEnvironmentOptions } from '../../config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function setupWindow(win: NuxtWindow, environmentOptions: { nuxt: NuxtEnvironmentOptions, nuxtRuntimeConfig?: Record<string, any>, nuxtRouteRules?: Record<string, any> }) {
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

  const rootId = environmentOptions.nuxt.rootId || 'nuxt-test'
  let el
  try {
    el = win.document.querySelector(rootId)
  }
  catch {
    // suppress error - jsdom bug with `__nuxt` query selector
  }
  if (el) {
    return () => {}
  }

  const consoleInfo = console.info
  console.info = (...args) => {
    if (args[0] === '<Suspense> is an experimental feature and its API will likely change.') {
      return
    }
    return consoleInfo(...args)
  }

  const app = win.document.createElement('div')
  // this is a workaround for a happy-dom bug with ids beginning with _
  app.id = rootId
  win.document.body.appendChild(app)

  const h3App = createApp()

  if (!win.fetch || !('Request' in win)) {
    await import('node-fetch-native/polyfill')
    // @ts-expect-error fetch polyfill
    win.URLSearchParams = globalThis.URLSearchParams
    // @ts-expect-error fetch polyfill
    win.Request ??= class Request extends globalThis.Request {
      constructor(input: RequestInfo, init?: RequestInit) {
        if (typeof input === 'string') {
          super(new URL(input, win.location.origin), init)
        }
        else {
          super(input, init)
        }
      }
    }
  }

  const nodeHandler = toNodeListener(h3App)

  const registry = new Set<string>()

  const _fetch = fetch
  win.fetch = async (input, _init) => {
    let url: string
    let init = _init
    if (typeof input === 'string') {
      url = input
    }
    else if (input instanceof URL) {
      url = input.toString()
    }
    else {
      url = input.url
      init = {
        method: init?.method ?? input.method,
        body: init?.body ?? input.body,
        headers: init?.headers ?? input.headers,
      }
    }

    const base = url.split('?')[0]!
    if (registry.has(base) || registry.has(url)) {
      url = '/_' + url
    }
    if (url.startsWith('/')) {
      const response = await fetchNodeRequestHandler(nodeHandler, url, init)
      return normalizeFetchResponse(response)
    }
    return _fetch(input, _init)
  }

  // @ts-expect-error fetch types differ slightly
  win.$fetch = createFetch({ fetch: win.fetch, Headers: win.Headers })

  win.__registry = registry
  win.__app = h3App

  // App manifest support
  const timestamp = Date.now()
  const routeRulesMatcher = toRouteMatcher(
    createRadixRouter({ routes: environmentOptions.nuxtRouteRules || {} }),
  )
  const matcher = exportMatcher(routeRulesMatcher)
  const manifestOutputPath = joinURL(
    environmentOptions?.nuxtRuntimeConfig?.app?.baseURL || '/',
    environmentOptions?.nuxtRuntimeConfig?.app?.buildAssetsDir || '_nuxt',
    'builds',
  )
  const manifestBaseRoutePath = joinURL('/_', manifestOutputPath)

  // @ts-expect-error untyped property
  const buildId = win.__NUXT__.config?.app.buildId || 'test'

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

  return () => {
    console.info = consoleInfo
  }
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
