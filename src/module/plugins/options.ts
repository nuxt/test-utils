import type { Plugin } from 'vite'
import type { EnvironmentOptions } from 'vitest/node'

const PLUGIN_NAME = 'nuxt:vitest:nuxt-environment-options'
const STUB_ID = 'nuxt-vitest-environment-options'

export function NuxtVitestEnvironmentOptionsPlugin(environmentOptions: EnvironmentOptions = {}): Plugin {
  const serializedOptions = JSON.stringify(environmentOptions)
  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    resolveId(id) {
      if (id.endsWith(STUB_ID)) {
        return STUB_ID
      }
    },
    load(id) {
      if (id.endsWith(STUB_ID)) {
        return `export default ${serializedOptions}`
      }
    },
    config() {
      return {
        define: {
          'process.env.__NUXT_VITEST_ENVIRONMENT_RESOLVED_OPTIONS__': JSON.stringify(serializedOptions),
        },
      }
    },
  }
}
