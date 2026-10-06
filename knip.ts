import { defineConfig } from 'knip/config'

export default defineConfig({
  workspaces: {
    '.': {
      entry: [
        'src/runtime/**/*.{js,ts,mjs,vue}',
        'test/fixtures/**/*.{js,ts,mjs,vue}',
      ],
      ignoreFiles: [
        'test/unit/__snapshots__/**/*',
      ],
      ignoreUnresolved: [
        '#build/root-component.mjs',
        '#app/nuxt-vitest-app-entry',
        '#nuxt-test-utils/h3',
      ],
      ignoreDependencies: [
        'nuxt-vitest-environment-options',
        'vitest-environment-nuxt',
        'happy-dom',
        'jsdom',
      ],
    },
  },
  ignoreWorkspaces: [
    'examples/**',
  ],
})
