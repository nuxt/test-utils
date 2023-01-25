// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['nuxt-vitest', '@nuxt/devtools-edge', '~/modules/custom'],
  vitest: {
    startOnBoot: true,
    logToConsole: true,
    vitestConfig: {
      dir: 'tests/nuxt',
    }
  },
  vite: {
    // TODO: fix bug with stubbing root package
    resolve: {
      alias: {
        'nuxt-vitest/config': '../packages/vitest-environment-nuxt/src/config',
        'vitest-environment-nuxt/utils':
          '../packages/vitest-environment-nuxt/src/utils',
        'vitest-environment-nuxt':
          '../packages/vitest-environment-nuxt/src/index',
      },
    },
  },
})
