import { defineNuxtConfig } from 'nuxt/config'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxt/test-utils/module', '~/modules/custom'],
  imports: {
    injectAtEnd: true,
    imports: [
      { name: 'useAliasExport1', as: 'useAliasExport1As', from: '~/composables/internal/use-alias-export.ts' },
      { name: 'useAliasExport2', as: 'useAliasExport2As', from: '~/composables/internal/use-alias-export.ts' },
      { name: 'useAliasExport3', as: 'useAliasExport3As', from: '~/composables/internal/use-alias-export.ts' },
    ],
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
