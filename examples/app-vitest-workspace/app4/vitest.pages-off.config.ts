import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineVitestProject({
  test: {
    name: 'nuxt-app4:pages-off',
    include: ['test/nuxt/pages-off/*.spec.ts'],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('.', import.meta.url)),
        overrides: {
          pages: false,
        },
      },
    },
  },
})
