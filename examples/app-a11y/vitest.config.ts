import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.spec.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.spec.ts'],
          environment: 'nuxt',
          setupFiles: [fileURLToPath(new URL('./test/nuxt/setup.ts', import.meta.url))],
        },
      }),
    ],
  },
})
