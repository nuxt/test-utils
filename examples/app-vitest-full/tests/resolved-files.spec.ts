import { fileURLToPath } from 'node:url'
import { test, expect } from 'vitest'
import { createVitest } from 'vitest/node'

test('it should include nuxt spec files', { timeout: 30000 }, async ({ onTestFinished }) => {
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
  const nuxtSpecFiles = testFiles.filter(file => file.project.name === 'nuxt')
  const regularSpecFiles = testFiles.filter(file => file.project.name === 'node')

  expect(nuxtSpecFiles.length).toEqual(26)
  expect(regularSpecFiles.length).toEqual(2)
})
