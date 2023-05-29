import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from 'nuxt-vitest/config'

export default defineVitestConfig({
  test: {
    dir: 'tests',
    coverage: {
      reportsDirectory: 'coverage',
    },
  },
  nuxt: {
    rootDir: fileURLToPath(new URL('./', import.meta.url)),
  }
})
