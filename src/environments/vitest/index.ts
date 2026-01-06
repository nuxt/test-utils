import type { Environment } from 'vitest/environments'
import { indexedDB } from 'fake-indexeddb'
import { joinURL } from 'ufo'
import defu from 'defu'
import { populateGlobal } from 'vitest/environments'

import { setupWindow } from '../../runtime/shared/environment'
import type { NuxtBuiltinEnvironment } from './types'
import happyDom from './env/happy-dom'
import jsdom from './env/jsdom'

const environmentMap = {
  'happy-dom': happyDom,
  jsdom,
}

export default <Environment>{
  name: 'nuxt',
  viteEnvironment: 'client',
  async setup(global, environmentOptions) {
    const url = joinURL(
      environmentOptions.nuxt?.url ?? 'http://localhost:3000',
      environmentOptions.nuxtRuntimeConfig?.app?.baseURL || '/',
    )

    const environmentName = environmentOptions.nuxt?.domEnvironment as NuxtBuiltinEnvironment
    const environment = environmentMap[environmentName] || environmentMap['happy-dom']
    const { window: win, teardown } = await environment(global, defu(environmentOptions, {
      happyDom: { url },
      jsdom: { url },
    }))

    if (environmentOptions.nuxt?.mock?.intersectionObserver) {
      win.IntersectionObserver ||= IntersectionObserver
    }

    if (environmentOptions.nuxt?.mock?.indexedDb) {
      // @ts-expect-error win.indexedDB is read-only
      win.indexedDB = indexedDB
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teardownWindow = await setupWindow(win, environmentOptions as any)
    const { keys, originals } = populateGlobal(global, win, {
      bindFunctions: true,
      additionalKeys: ['fetch', 'Request'],
    })

    return {
      // called after all tests with this env have been run
      teardown() {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        keys.forEach(key => delete global[key])
        teardownWindow()
        originals.forEach((v, k) => (global[k] = v))

        // Stub to prevent errors from delayed callbacks
        if (!global.IntersectionObserver) {
          global.IntersectionObserver = IntersectionObserver
        }

        teardown()
      },
    }
  },
}

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
