// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/test-utils/module'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  typescript: {
    tsConfig: {
      include: ['../test/nuxt-ignore.unit.test.ts'],
    },
  },
})
