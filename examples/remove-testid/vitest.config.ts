import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'e2e',
          dir: './test/e2e',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          dir: './test/nuxt',
        },
      }),
    ],
  },
})
