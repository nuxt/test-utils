import { createFetch } from 'ofetch'
import { joinURL } from 'ufo'
import { defineEventHandler } from './h3.ts'
import { createRouter as createRadixRouter, exportMatcher, toRouteMatcher } from 'radix3'
import type { NuxtWindow } from '../../vitest-environment.ts'
import type { NuxtEnvironmentResolvedOptions } from '../../config.ts'
import { createFetchForH3V1 } from './h3-v1.ts'
import { createFetchForH3V2 } from './h3-v2.ts'

export async function setupWindow(win: NuxtWindow, environmentOptions: NuxtEnvironmentResolvedOptions) {
  const nuxtConfig = environmentOptions.nuxtConfig

  win.__NUXT_VITEST_ENVIRONMENT__ = true
  win.__NUXT__ = {
    serverRendered: false,
    config: {
      public: {},
      app: { baseURL: '/' },
      ...nuxtConfig?.runtimeConfig,
    },
    data: {},
    state: {},
  }

  const consoleInfo = console.info
  console.info = (...args) => {
    if (args[0] === '<Suspense> is an experimental feature and its API will likely change.') {
      return
    }
    return consoleInfo(...args)
  }

  createElementAndAppend(win, nuxtConfig?.app.rootTag || 'div', {
    ...nuxtConfig?.app.rootAttrs,
    id: environmentOptions.nuxt.rootId || 'nuxt-test',
  })
  createElementAndAppend(win, nuxtConfig?.app.teleportTag || 'div', nuxtConfig?.app.teleportAttrs)

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

  const res = environmentOptions.nuxt.h3Version === 2
    ? await createFetchForH3V2()
    : await createFetchForH3V1()

  win.fetch = res.fetch

  // @ts-expect-error fetch types differ slightly
  win.$fetch = createFetch({ fetch: win.fetch, Headers: win.Headers })

  win.__registry = res.registry
  win.__app = res.h3App

  // App manifest support
  const timestamp = Date.now()
  const routeRulesMatcher = toRouteMatcher(
    createRadixRouter({ routes: nuxtConfig?.routeRules || {} }),
  )
  const matcher = exportMatcher(routeRulesMatcher)
  const manifestOutputPath = joinURL(
    nuxtConfig?.runtimeConfig?.app?.baseURL || '/',
    nuxtConfig?.runtimeConfig?.app?.buildAssetsDir || '_nuxt',
    'builds',
  )
  const manifestBaseRoutePath = joinURL('/_', manifestOutputPath)

  // @ts-expect-error untyped property
  const buildId = win.__NUXT__.config?.app.buildId || 'test'

  res.h3App.use(
    `${manifestBaseRoutePath}/latest.json`,
    defineEventHandler(() => ({
      id: buildId,
      timestamp,
    })),
  )
  res.h3App.use(
    `${manifestBaseRoutePath}/meta/${buildId}.json`,
    defineEventHandler(() => ({
      id: buildId,
      timestamp,
      matcher,
      prerendered: [],
    })),
  )

  res.registry.add(`${manifestOutputPath}/latest.json`)
  res.registry.add(`${manifestOutputPath}/meta/${buildId}.json`)

  return () => {
    console.info = consoleInfo
  }
}

function createElementAndAppend(
  win: NuxtWindow,
  tag: string,
  attrs: NonNullable<NuxtEnvironmentResolvedOptions['nuxtConfig']>['app']['rootAttrs']
    | NonNullable<NuxtEnvironmentResolvedOptions['nuxtConfig']>['app']['teleportAttrs']
    | undefined,
) {
  if (attrs?.id && win.document.getElementById(attrs.id)) {
    return
  }

  const element = win.document.createElement(tag)
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value !== false && value != null) {
      element.setAttribute(key, value === true ? '' : String(value))
    }
  }

  win.document.body.appendChild(element)
}
