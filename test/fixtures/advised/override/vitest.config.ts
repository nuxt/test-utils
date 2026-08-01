import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt1',
          environment: 'nuxt',
          include: ['./test/app/**/*.spec.ts'],
          environmentOptions: {
            nuxt: {
              overrides: {
                rootDir: fileURLToPath(new URL('test/fixture/', import.meta.url)),
              },
            },
          },
        },
      }),
      await defineVitestProject({
        extends: true,
        test: {
          name: 'nuxt2',
          environment: 'nuxt',
          include: ['./test/app/**.spec.ts'],
          environmentOptions: {
            nuxt: {
              overrides: {
                rootDir: fileURLToPath(new URL('test/fixture/', import.meta.url)),
              },
            },
          },
        },
      }),
      {
        test: {
          name: 'unit1',
          include: ['./test/unit/**.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit2',
          include: ['./test/unit/**.spec.ts'],
        },
      },
    ],
  },
})
