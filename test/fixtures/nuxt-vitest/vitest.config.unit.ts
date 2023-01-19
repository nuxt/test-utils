import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'unit',
    dir: 'tests/unit',
    coverage: {
      reportsDirectory: 'coverage/unit',
    },
  },
})
