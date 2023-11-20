import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    dir: 'tests',
    deps: {
      inline: ['@nuxt/test-utils', /@nuxt\/test-utils/, /\/node_modules\/nuxt\//]
    },
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
