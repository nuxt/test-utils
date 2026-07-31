// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  // default from Nuxt v5, but pinned here so the example keeps testing this code path
  experimental: { nitroViteEnvironment: true },
  compatibilityDate: '2024-04-03',
})
