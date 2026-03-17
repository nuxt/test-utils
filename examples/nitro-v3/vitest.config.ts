import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['**/nuxt/*.spec.ts'],
          environmentOptions: {
            nuxt: {
              // TODO: remove once h3 in nuxt/nitro-server is v2
              h3Version: 2,
            },
          },
        },
      }),
      {
        test: {
          name: 'unit',
          include: ['**/*.e2e.spec.ts'],
        },
      },
    ],
  },
})
