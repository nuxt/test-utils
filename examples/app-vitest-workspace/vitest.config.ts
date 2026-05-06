import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['*/vitest*.config.ts'],
    onConsoleLog(log) {
      if (log.includes('<Suspense> is an experimental feature')) {
        return false
      }
    },
  },
})
