import type { Environment } from 'vitest/environments'
import { resolveModulePath } from 'exsolve'
import { indexedDB } from 'fake-indexeddb'
import { joinURL } from 'ufo'
import defu from 'defu'

import { setupWindow } from '../../runtime/shared/environment'
import type { SetupWindowNuxtEnvironmentOptions } from '../../runtime/shared/environment'
import happyDom from './env/happy-dom'
import jsdom from './env/jsdom'

const environmentMap = {
  'happy-dom': happyDom,
  jsdom,
}

export default <Environment>{
  name: 'nuxt',
  viteEnvironment: 'client',
  async setup(global, _environmentOptions) {
    const { populateGlobal } = await importVitestEnvironments()

    const environmentOptions = mergeSetupWindowEnvironmentOptions(_environmentOptions)
    const url = joinURL(
      environmentOptions.nuxt.url ?? 'http://localhost:3000',
      environmentOptions.nuxtRuntimeConfig?.app?.baseURL || '/',
    )

    const environmentName = environmentOptions.nuxt.domEnvironment || 'happy-dom'
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

// Manually merge with base config because `@vitest-environment-options` doesn't merge by default
function mergeSetupWindowEnvironmentOptions(
  environmentOptions: Record<string, unknown> = {},
): SetupWindowNuxtEnvironmentOptions {
  const {
    nuxt: nuxtEnvironmentOptions = {},
  } = environmentOptions as unknown as SetupWindowNuxtEnvironmentOptions

  const serializedResolvedOptions = process.env.__NUXT_VITEST_ENVIRONMENT_RESOLVED_OPTIONS__
  const baseEnvironmentOptions = serializedResolvedOptions
    ? JSON.parse(serializedResolvedOptions)
    : environmentOptions

  return defu(
    {
      nuxt: {
        url: nuxtEnvironmentOptions.url,
        domEnvironment: nuxtEnvironmentOptions.domEnvironment,
      },
    },
    baseEnvironmentOptions,
  )
}

// This can be removed when dropping support for vitest 4.0.x (We can static import from 'vitest/runtime')
async function importVitestEnvironments() {
  const pkg = resolveModulePath('vitest/runtime', { try: true }) ? 'vitest/runtime' : 'vitest/environments'
  return await import(pkg) as typeof import('vitest/environments')
}

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
