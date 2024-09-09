// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/test-utils/module', '~/modules/custom'],
  vite: {
    vue: {
      script: {
        defineModel: true,
      },
    },
  },
  testUtils: {
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
      testValue: 'default',
    },
  },
})
