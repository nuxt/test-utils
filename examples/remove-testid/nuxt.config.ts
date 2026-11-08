const buildDir = process.env.FEATURE ? `./.nuxt/test/build-${process.env.FEATURE}` : undefined

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/test-utils/module'],
  $env: {
    custom: {
      testUtils: {
        removeTestIdAttribute: 'data-test',
      },
    },
  },
  $production: {
    testUtils: {
      removeTestIdAttribute: true,
    },
  },
  devtools: false,
  buildDir,
  compatibilityDate: '2024-04-03',
  nitro: {
    output: {
      dir: buildDir ? `${buildDir}/output` : undefined,
    },
  },
})
