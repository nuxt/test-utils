import { defineConfigWithNuxtEnv } from 'vitest-environment-nuxt/config'

export default defineConfigWithNuxtEnv({
  // TODO: fix bug with stubbing root package
  resolve: {
    alias: {
      'vitest-environment-nuxt/utils': '../src/utils',
      'vitest-environment-nuxt': '../src/index',
    },
  },
})
