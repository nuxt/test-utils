import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineVitestProject({
  test: {
    name: 'nuxt-app3',
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('.', import.meta.url)),
        overrides: {
          app: {
            rootAttrs: {
              id: '__test_root',
            },
            rootTag: 'main',
            teleportAttrs: {
              id: '__test_teleport',
            },
            teleportTag: 'p',
          },
        },
      },
    },
  },
})
