import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineVitestProject({
  test: {
    name: 'nuxt-app1',
    include: ['**/*.nuxt.spec.ts'],
    setupFiles: ['test/setup/setup-nuxt.ts'],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
  },
})
