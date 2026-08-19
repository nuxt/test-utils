import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      '*/vitest*.config.ts',
      import('./app5/bare.vitest.config.ts').then(r => r.default()),
    ],
    onConsoleLog(log) {
      if (log.includes('<Suspense> is an experimental feature')) {
        return false
      }
    },
  },
})
