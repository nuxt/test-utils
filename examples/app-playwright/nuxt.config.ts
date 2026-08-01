// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      myValue: 'Welcome to Playwright!',
    },
  },
  compatibilityDate: '2024-04-03',
})
