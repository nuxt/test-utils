import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from 'nuxt-vitest/config'

export default defineVitestConfig({
  test: {
    dir: 'tests',
    coverage: {
      reportsDirectory: 'coverage',
    },
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('./', import.meta.url)),
        domEnvironment:
          (process.env.VITEST_DOM_ENV as 'happy-dom' | 'jsdom') ?? 'happy-dom',

        mock: {
          indexedDb: true,
        },
      },
    },
    setupFiles: ['./tests/setup/mocks.ts'],
    globals: true,
  },
})
