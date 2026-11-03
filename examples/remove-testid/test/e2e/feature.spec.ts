import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'

async function setupTest(fixtureName: string) {
  await setup({
    rootDir: fileURLToPath(new URL('../../', import.meta.url)),
    build: false,
    browser: true,
    nuxtConfig: {
      nitro: {
        output: {
          dir: fileURLToPath(new URL(`../../.nuxt/test/${fixtureName}/output`, import.meta.url)),
        },
      },
    },
  })
}

describe('feature enabled build', async () => {
  await setupTest('build-enabled')

  it('should remove default test attribute when enabled', async () => {
    const page = await createPage('/')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading.isVisible()).resolves.toBeTruthy()
    await expect(heading.getAttribute('data-testid')).resolves.toBeFalsy()
    await expect(heading.getAttribute('data-test')).resolves.toBe('world')
  })
})

describe('feature disabled build', async () => {
  await setupTest('build-disabled')

  it('should keep test attributes when disabled', async () => {
    const page = await createPage('/')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading.isVisible()).resolves.toBeTruthy()
    await expect(heading.getAttribute('data-testid')).resolves.toBe('hello')
    await expect(heading.getAttribute('data-test')).resolves.toBe('world')
  })
})

describe('feature custom build', async () => {
  await setupTest('build-custom')

  it('should remove custom test attribute when enabled', async () => {
    const page = await createPage('/')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading.isVisible()).resolves.toBeTruthy()
    await expect(heading.getAttribute('data-testid')).resolves.toBe('hello')
    await expect(heading.getAttribute('data-test')).resolves.toBeFalsy()
  })
})
