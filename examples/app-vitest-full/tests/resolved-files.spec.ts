import { fileURLToPath } from 'node:url'
import { test, expect } from 'vitest'
import { createVitest } from 'vitest/node'

test('it should include nuxt spec files', {
  timeout: 10000,
}, async () => {
  const vitest = await createVitest('test', {
    config: fileURLToPath(new URL('../vitest.config.ts', import.meta.url)),
    dir: fileURLToPath(new URL('../', import.meta.url)),
  })
  const testFiles = await vitest.globTestSpecifications()

  await vitest.close()

  const nuxtSpecFiles = testFiles.filter(file => file.moduleId.endsWith('nuxt.spec.ts') || file.moduleId.includes('/nuxt/'))
  const regularSpecFiles = testFiles.filter(file => file.moduleId.endsWith('.spec.ts') && !file.moduleId.endsWith('nuxt.spec.ts') && !file.moduleId.includes('/nuxt/'))

  expect(nuxtSpecFiles.length).toEqual(19)
  for (const file of nuxtSpecFiles) {
    expect(file.project.name).toEqual('nuxt')
  }

  expect(regularSpecFiles.length).toEqual(2)
  for (const file of regularSpecFiles) {
    expect(file.project.name).toEqual('node')
  }
})
