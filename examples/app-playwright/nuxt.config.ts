// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-07-11',
  // TODO: Add to default options?
  // https://nuxt.com/docs/api/nuxt-config#ignore
  ignore: [
    'playwright-report',
    'test-results',
  ],
  runtimeConfig: {
    public: {
      myValue: 'Welcome to Playwright!',
    },
  },
})
