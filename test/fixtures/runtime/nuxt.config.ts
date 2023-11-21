// https://v3.nuxtjs.org/api/configuration/nuxt.config
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
  runtimeConfig: {
    public: {
      hello: 'world',
    },
  },
})
