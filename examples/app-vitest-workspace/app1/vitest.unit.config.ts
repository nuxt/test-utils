import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'unit-app1',
    include: ['**/*.unit.spec.ts'],
  },
})
