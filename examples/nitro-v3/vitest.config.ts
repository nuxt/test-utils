import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['**/nuxt/*.spec.ts'],
        },
      }),
      {
        test: {
          name: 'e2e',
          include: ['**/*.e2e.spec.ts'],
        },
      },
    ],
  },
})
