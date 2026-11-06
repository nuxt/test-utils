import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  timeout: 120_000,
  use: {
    trace: 'on-first-retry',
    nuxt: {
      rootDir: import.meta.dirname,
    },
  },
  projects: [
    {
      name: 'chromium-headless-shell',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
