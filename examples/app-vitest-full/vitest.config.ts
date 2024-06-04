import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    dir: 'tests',
    coverage: {
      reportsDirectory: 'coverage',
    },
    includeSource: ['../pages/index.vue'],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('./', import.meta.url)),
        domEnvironment: (process.env.VITEST_DOM_ENV as 'happy-dom' | 'jsdom') ?? 'happy-dom',
        overrides: {
          runtimeConfig: {
            public: {
              hello: 'nuxt',
            },
          },
        },
        mock: {
          indexedDb: true,
        },
      },
    },
    setupFiles: './tests/setup/mocks.ts',
    globals: true,
  },
})
