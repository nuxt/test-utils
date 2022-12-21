import { defineConfigWithNuxtEnv } from 'vitest-environment-nuxt/config'

export default defineConfigWithNuxtEnv({
  test: {
    name: 'nuxt',
    dir: 'tests/nuxt',
    coverage: {
      reportsDirectory: 'coverage/nuxt'
    }
  },
  // TODO: fix bug with stubbing root package
  resolve: {
    alias: {
      'vitest-environment-nuxt/utils': '../src/utils',
      'vitest-environment-nuxt/config': '../src/config',
      'vitest-environment-nuxt': '../src/index',
    },
  },
})
