// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    rootId: 'nuxt-test',
  },
  runtimeConfig: {
    public: {
      site: {
        title: 'Vitest Browser Mode',
      },
    },
  },
  compatibilityDate: '2024-04-03',
})
