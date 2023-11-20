import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    'src/experimental',
    'src/config',
    'src/experimental',
    'src/module',
    'src/runtime-utils',
    'src/vitest-environment',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ],
  externals: [
  ]
})
