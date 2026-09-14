import { defineVitestConfig } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'

const isolate = process.env.VITEST_ISOLATE !== 'false'

export default defineVitestConfig({
  test: {
    isolate,
    include: ['./test/**/*.spec.ts'],
    exclude: isolate ? ['./test/**/*.non-isolate.spec.ts'] : undefined,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        setupScope: 'worker',
      },
    },
    setupFiles: [
      '@nuxt/test-utils/browser',
      ...isolate ? [] : ['./test/nuxt/setup.ts'],
    ],
    restoreMocks: isolate,
  },
})
