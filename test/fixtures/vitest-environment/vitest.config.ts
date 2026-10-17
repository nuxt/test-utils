import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#nuxt-test-utils/h3': 'h3',
    },
  },
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {},
    },
  },
})
