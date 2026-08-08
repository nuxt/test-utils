// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  vite: {
    optimizeDeps: {
      include: [
        'example-use-cjs-cjs-pure',
        'example-use-cjs-cjs-wrapper',
      ],
    },
  },
})
