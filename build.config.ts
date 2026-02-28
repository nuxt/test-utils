import { defineBuildConfig } from 'unbuild'

const isStub = process.argv.includes('--stub')

export default defineBuildConfig({
  declaration: 'node16',
  entries: [
    'src/e2e',
    'src/playwright',
    'src/experimental',
    'src/config',
    'src/module.ts',
    'src/vitest-environment',
    'src/vitest-wrapper/cli.ts',
    isStub ? { input: 'src/runtime-utils/', outDir: 'dist/runtime-utils', format: 'esm' } : 'src/runtime-utils/index.mjs',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' },
  ],
  externals: [
    '#dirs',
    'vite',
    'bun:test',
    '#app/entry',
    '#build/root-component.mjs',
    '#imports',
    '@nuxt/schema',
    'vue-router',
    'nitropack',
    '@nuxt/a11y/test-utils',
    '@nuxt/a11y/test-utils/setup',
    '@nuxt/a11y/test-utils/playwright',
  ],
})
