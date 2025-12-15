import type { WorkerGlobalState, EnvironmentOptions } from 'vitest'
import type { Environment } from 'vitest/environments'
import { indexedDB } from 'fake-indexeddb'
import { joinURL } from 'ufo'
import defu from 'defu'
import { populateGlobal } from 'vitest/environments'

import { setupWindow } from '../../runtime/shared/environment'
import happyDom from './env/happy-dom'
import jsdom from './env/jsdom'

const environmentMap = {
  'happy-dom': happyDom,
  jsdom,
}

export default <Environment>{
  name: 'nuxt',
  transformMode: 'web',
  async setup(global, _environmentOptions) {
    const environmentOptions = mergeEnvironmentOptions(_environmentOptions)
    const url = joinURL(environmentOptions.nuxt.url!,
      environmentOptions.nuxtRuntimeConfig?.app?.baseURL || '/',
    )

    const environmentName = environmentOptions.nuxt.domEnvironment!
    const environment = environmentMap[environmentName] || environmentMap['happy-dom']
    const { window: win, teardown } = await environment(global, defu(environmentOptions, {
      happyDom: { url },
      jsdom: { url },
    }))

    if (environmentOptions.nuxt.mock?.intersectionObserver) {
      win.IntersectionObserver ||= IntersectionObserver
    }

    if (environmentOptions.nuxt.mock?.indexedDb) {
      // @ts-expect-error win.indexedDB is read-only
      win.indexedDB = indexedDB
    }

    const teardownWindow = await setupWindow(win, environmentOptions)
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

type SetupWindowEnvironment = Parameters<typeof setupWindow>[1]

export function mergeEnvironmentOptions(
  options: EnvironmentOptions,
): SetupWindowEnvironment {
  // Manually merge with base config as docblock options don't merge by default.
  // @ts-expect-error untyped global
  const state: WorkerGlobalState = globalThis.__vitest_worker__

  const defaultOptions: EnvironmentOptions = {
    nuxt: {
      url: 'http://localhost:3000',
      startOn: 'setupFile',
      domEnvironment: 'happy-dom',
    },
  }

  return defu({
    nuxt: {
      url: options.nuxt?.url,
      startOn: options.nuxt?.startOn,
      domEnvironment: options.nuxt?.domEnvironment,
    } satisfies EnvironmentOptions['nuxt'],
  }, state.config.environmentOptions, defaultOptions)
}

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
