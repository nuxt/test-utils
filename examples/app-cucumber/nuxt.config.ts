// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  typescript: {
    tsConfig: {
      compilerOptions: {
        rootDir: '.',
        // TODO: drop once Nuxt enables this by default for source-pointing exports.
        // `@nuxt/test-utils/e2e` resolves to `.ts` source via package exports.
        allowImportingTsExtensions: true,
      },
    },
  },
})
