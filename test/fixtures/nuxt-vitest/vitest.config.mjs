import { defineConfig } from 'vite'
import { getVitestConfig } from 'vitest-environment-nuxt/config'

const viteConfig = await getVitestConfig()

export default defineConfig({
  ...viteConfig,
  resolve: {
    ...viteConfig.resolve,
    alias: {
      ...viteConfig.resolve?.alias,
      // TODO: fix bug with stubbing root package
      'vitest-environment-nuxt/utils': '../src/utils',
      'vitest-environment-nuxt': '../src/index',
    },
  },
})
