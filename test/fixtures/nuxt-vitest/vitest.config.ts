import { defineConfigWithNuxt } from 'nuxt-vitest/config'

export default defineConfigWithNuxt({
  test: {
    dir: 'tests',
    coverage: {
      reportsDirectory: 'coverage',
    },
  },
})
