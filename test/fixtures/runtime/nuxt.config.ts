// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxt/test-utils/module', '@nuxt/devtools', '~/modules/custom'],
  vitest: {
    startOnBoot: true,
    logToConsole: true,
    vitestConfig: {
      setupFiles: ['./tests/setup/mocks'],
      environmentOptions: {
        nuxt: {
          mock: {
            indexedDb: true,
          },
        },
      },
    },
  },
  vite: {
    // TODO: fix bug with stubbing root package
    resolve: {
      alias: {
        '@nuxt/test-utils/config': '../../../src/config',
        '@nuxt/test-utils/module': '../../../src/module',
        '@nuxt/test-utils/runtime-utils': '../../../src/utils',
      },
    },
  },
  imports: {
    injectAtEnd: true,
  },
  runtimeConfig: {
    public: {
      hello: 'world',
    },
  },
})
