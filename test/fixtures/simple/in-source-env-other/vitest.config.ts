import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    includeSource: ['./app/composables/*.ts', './app/components/**/*.vue'],
  },
})
