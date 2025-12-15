import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environmentOptions: {
            nuxt: {
              domEnvironment: 'jsdom',
            },
          },
          include: ['**/*.nuxt.spec.ts'],
        },
      }),
      {
        test: {
          name: 'unit',
          include: ['**/*.unit.spec.ts'],
        },
      },
    ],
  },
})
