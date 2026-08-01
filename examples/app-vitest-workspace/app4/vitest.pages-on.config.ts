import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineVitestProject({
  test: {
    name: 'nuxt-app4:pages-on',
    include: ['test/nuxt/pages-on/*.spec.ts'],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('.', import.meta.url)),
        overrides: {
          pages: true,
        },
      },
    },
  },
})
