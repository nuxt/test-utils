import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['./nuxt-test/**.spec.ts'],
        },
      }),
      {
        test: {
          name: 'unit',
          include: ['./unit-test/**.spec.ts'],
        },
      },
    ],
  },
})
