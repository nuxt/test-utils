import { defineVitestConfig } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'

const browserEnabled = process.argv.some(x => x.includes('--browser.enabled'))

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    dir: browserEnabled ? './test/browser' : './test/nuxt',
    maxWorkers: 1,
    browser: {
      enabled: browserEnabled,
      headless: true,
      screenshotFailures: false,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    ui: false,
  },
})
