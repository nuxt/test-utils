import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    includeSource: ['./app/composables/*.ts', './app/components/**/*.vue'],
  },
})
