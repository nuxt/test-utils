import { fileURLToPath } from 'node:url'
import { test, expect } from 'vitest'
import { createVitest } from 'vitest/node'

test('it should include nuxt spec files', { timeout: 30000 }, async () => {
  const vitest = await createVitest('test', {
    config: fileURLToPath(new URL('../vitest.config.ts', import.meta.url)),
    dir: fileURLToPath(new URL('../', import.meta.url)),
    filesOnly: true,
    run: false,
    watch: false,
  })
  const testFiles = await vitest.globTestSpecifications()

  await vitest.close()

  const NUXT_PATH_RE = /[\\/]tests[\\/]nuxt[\\/]/
  const nuxtSpecFiles = testFiles.filter(file => file.moduleId.endsWith('nuxt.spec.ts') || NUXT_PATH_RE.test(file.moduleId))
  const regularSpecFiles = testFiles.filter(file => file.moduleId.endsWith('.spec.ts') && !file.moduleId.endsWith('nuxt.spec.ts') && !NUXT_PATH_RE.test(file.moduleId))

  expect(nuxtSpecFiles.length).toEqual(24)
  for (const file of nuxtSpecFiles) {
    expect(file.project.name).toEqual('nuxt')
  }

  expect(regularSpecFiles.length).toEqual(2)
  for (const file of regularSpecFiles) {
    expect(file.project.name).toEqual('node')
  }
})
