import { defineWorkspace } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineWorkspace([
  await defineVitestProject({
    test: {
      name: 'nuxt',
      include: ['**/*.nuxt.spec.ts'],
    },
  }),
  {
    test: {
      name: 'unit',
      include: ['**/*.unit.spec.ts'],
    },
  },
])
