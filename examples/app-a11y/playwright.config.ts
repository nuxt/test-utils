import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { isCI, isWindows } from 'std-env'

const nuxtOptions = {
  rootDir: fileURLToPath(new URL('.', import.meta.url)),
}

export default defineConfig<ConfigOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: isWindows ? 60000 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'a11y',
      use: { ...devices['Desktop Chrome'], nuxt: { ...nuxtOptions, a11y: { threshold: 999 } } },
      testMatch: 'a11y.test.ts',
    },
    {
      name: 'auto-scan',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'], nuxt: { ...nuxtOptions, a11y: true } },
      testMatch: 'auto-scan.test.ts',
    },
  ],
})
