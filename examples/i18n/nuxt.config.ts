// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'de', name: 'German', file: 'de.yml' },
      { code: 'en', name: 'English', file: 'en.yml' },
    ],
  },
})
