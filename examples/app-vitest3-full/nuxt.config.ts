// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxt/test-utils/module', '~/modules/custom'],
  imports: {
    injectAtEnd: true,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      hello: 'world',
      testValue: 'default',
    },
  },
  compatibilityDate: '2024-04-03',
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
})
