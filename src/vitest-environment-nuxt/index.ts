import type { Environment } from 'vitest'
import { Window, GlobalWindow } from 'happy-dom'
import { createFetch } from 'ofetch'
import { joinURL } from 'ufo'
import { createApp, toNodeListener } from 'h3'
import type { App } from 'h3'
import { populateGlobal } from 'vitest/environments'
import {
  createCall,
  createFetch as createLocalFetch,
} from 'unenv/runtime/fetch/index'

export default <Environment>{
  name: 'nuxt',
  async setup(_, environmentOptions) {
    const startingURL = environmentOptions.url || joinURL('http://localhost:3000', environmentOptions?.nuxtRuntimeConfig.app?.baseURL || '/')
    
    const win: NuxtWindow = new (GlobalWindow || Window)({ url: startingURL }) as any

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

    // @ts-expect-error TODO: fix in h3
    const localCall = createCall(toNodeListener(h3App))
    const localFetch = createLocalFetch(localCall, globalThis.fetch)

    const registry = new Set<string>()

    win.fetch = (init: string, options?: any) => {
      if (typeof init === 'string' && registry.has(init)) {
        init = '/_' + init
      }
      return localFetch(init, options)
    }

    win.$fetch = createFetch({ fetch: win.fetch, Headers: win.Headers as any })

    win.__registry = registry
    win.__app = h3App

    const { keys, originals } = populateGlobal(global, win, {
      bindFunctions: true,
    })

    // @ts-ignore
    await import('#app/entry').then(r => r.default())

    return {
      // called after all tests with this env have been run
      teardown() {
        win.happyDOM.cancelAsync()
        // @ts-expect-error
        keys.forEach(key => delete global[key])
        // @ts-expect-error
        originals.forEach((v, k) => (global[k] = v))
      },
    }
  },
}

interface NuxtWindow extends Window {
  __app: App
  __registry: Set<string>
  __NUXT__: any
  $fetch: any
  fetch: any
  IntersectionObserver: any
}
