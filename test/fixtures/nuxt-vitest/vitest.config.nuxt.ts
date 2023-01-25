import { defineConfigWithNuxt } from 'nuxt-vitest/config'

export default defineConfigWithNuxt({
  test: {
    name: 'nuxt',
    dir: 'tests/nuxt',
    coverage: {
      reportsDirectory: 'coverage/nuxt',
    },
  },
})
