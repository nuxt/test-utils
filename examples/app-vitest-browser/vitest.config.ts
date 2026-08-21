import { defineVitestConfig } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'

export default defineVitestConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    environment: 'nuxt',
    setupFiles: ['@nuxt/test-utils/vitest-browser-nuxt'],
  },
})
