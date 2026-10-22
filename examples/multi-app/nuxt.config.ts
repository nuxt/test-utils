export default defineNuxtConfig({
  appId: 'main-app',
  future: {
    multiApp: true,
  },
  compatibilityDate: '2024-04-03',
  typescript: {
    tsConfig: {
      include: ['../test/browser/**/*.spec.ts'],
    },
  },
})
