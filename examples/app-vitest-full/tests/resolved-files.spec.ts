import { fileURLToPath } from 'node:url'
import { test, expect } from 'vitest'
import { createVitest } from 'vitest/node'

test('it should include nuxt spec files', { timeout: process.env.CI ? 60_000 : 30_000 }, async ({ onTestFinished }) => {
  const vitest = await createVitest('test', {
    config: fileURLToPath(new URL('../vitest.config.ts', import.meta.url)),
    dir: fileURLToPath(new URL('../', import.meta.url)),
    filesOnly: true,
    run: false,
    watch: false,
  })

  onTestFinished(async () => {
    await vitest.close()
  })

  const testFiles = await vitest.globTestSpecifications()
  // const testFiles = await vitest.experimental_parseSpecifications(testSpecs)

  const nuxtSpecFiles = testFiles.filter(file => file.project.name === 'nuxt')
  const regularSpecFiles = testFiles.filter(file => file.project.name === 'node')

  expect(nuxtSpecFiles.length).toEqual(30)
  expect(regularSpecFiles.length).toEqual(3)

  // Test files using `@vitest-environment node`
  const nuxtNodeSpecs = await vitest.collectTests(nuxtSpecFiles.filter(file =>
    file.moduleId.includes('/app-vitest-full/pages/')
    || file.moduleId.includes('/app-vitest-full/composables/'),
  ))
  const nuxtNodeFiles = nuxtNodeSpecs.testModules.filter(module => module.viteEnvironment?.name === 'ssr')
  expect(nuxtNodeFiles.length).toEqual(2)
})
