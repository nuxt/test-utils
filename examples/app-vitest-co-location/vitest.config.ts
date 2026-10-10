import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.unit.{test,spec}.ts'],
        },
      },
      {
        test: {
          name: 'e2e',
          environment: 'node',
          include: ['**/*.e2e.{test,spec}.ts'],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['**/*.nuxt.{test,spec}.ts'],
        },
      }),
      await defineVitestProject({
        test: {
          name: 'browser',
          environment: 'nuxt',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          include: ['**/*.browser.{test,spec}.ts'],
        },
      }),
    ],
    onConsoleLog(log) {
      if (log.includes('<Suspense> is an experimental feature')) {
        return false
      }
    },
  },
})
