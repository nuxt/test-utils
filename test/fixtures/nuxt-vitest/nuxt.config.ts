export default defineNuxtConfig({
  modules: ['@nuxt/test-utils/module', '~/modules/custom'],
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
  imports: {
    injectAtEnd: true,
  },
  vite: {
    // TODO: fix bug with stubbing root package
    resolve: {
      alias: {
        '@nuxt/test-utils/config': '../../src/config',
        '@nuxt/test-utils/runtime-utils': '../../src/runtime-utils',
      },
    },
  },
  runtimeConfig: {
    public: {
      hello: 'world',
    },
  },
})
