import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'app',
          dir: 'test/nuxt/app',
        },
      }),
      await defineVitestProject({
        test: {
          name: 'boot',
          dir: 'test/nuxt/boot',
          environmentOptions: {
            nuxt: {
              startOn: 'beforeAll',
            },
          },
        },
      }),
    ],
  },
})
