import { defineConfig } from 'tsdown'

const NEVER_BUNDLE = [
  '#dirs',
  'vite',
  'bun:test',
  /^#app(\/|$)/,
  /^#build(\/|$)/,
  '#imports',
  '@nuxt/schema',
  'vue-router',
  'nitropack',
  /^@nuxt\/test-utils(\/|$)/,
]

export default defineConfig([
  {
    dts: true,
    exports: false,
    entry: [
      'src/e2e.ts',
      'src/playwright.ts',
      'src/experimental.ts',
      'src/config.ts',
      'src/module.ts',
      'src/vitest-environment.ts',
      'src/vitest-wrapper/cli.ts',
      'src/runtime-utils/index.ts',
      'src/vitest-browser-nuxt/index.ts',
      'src/vitest-browser-nuxt/pure.ts',
    ],
    deps: {
      onlyBundle: [],
      neverBundle: NEVER_BUNDLE,
    },
  },
  {
    unbundle: true,
    dts: false,
    entry: ['src/runtime/**/*.ts', '!src/runtime/**/*.d.ts'],
    outDir: 'dist/runtime',
    deps: {
      skipNodeModulesBundle: true,
      neverBundle: NEVER_BUNDLE,
    },
  },
])
