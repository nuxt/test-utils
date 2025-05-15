import { defineVitestConfig } from '@nuxt/test-utils/config'

const browserConfig = {
  browser: {
    enabled: true,
    provider: 'playwright',
    instances: [{ browser: 'chromium' }],
  },
  environment: 'nuxt',
  include: ['tests/browser/**/*.spec.ts'],
  setupFiles: ['vitest-browser-vue'],
}

const defaultConfig = {
  environment: 'nuxt',
  exclude: ['tests/browser/**/*.spec.ts', 'node_modules/**', 'dist/**', '.data/**'],
}

export default defineVitestConfig({
  test: process.env.VITEST_BROWSER_ENABLED === 'true' ? browserConfig : defaultConfig,
})
