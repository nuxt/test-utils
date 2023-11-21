import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    'src/experimental',
    'src/config',
    'src/module.ts',
    'src/runtime-utils.ts',
    'src/vitest-environment',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ],
  externals: [
    "#app/entry",
    "#build/root-component.mjs",
    "#imports",
  ]
})
