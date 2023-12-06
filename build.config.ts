import { defineBuildConfig } from 'unbuild'

const isStub = process.argv.includes('--stub')

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    'src/experimental',
    'src/config',
    'src/module.ts',
    'src/vitest-environment',
    isStub ? { input: 'src/runtime-utils/', outDir: 'dist/runtime-utils', format: 'esm' } : 'src/runtime-utils/index.mjs',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ],
  externals: [
    "#app/entry",
    "#build/root-component.mjs",
    "#imports",
  ]
})
