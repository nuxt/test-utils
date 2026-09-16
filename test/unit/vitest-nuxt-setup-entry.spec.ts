import { x } from 'tinyexec'
import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

const TEST_TIMEOUT = process.env.CI ? 60_000 : 30_000

const fixtureDir = fileURLToPath(new URL('../fixtures/isolate-setup', import.meta.url))

describe('nuxt setup entry', () => {
  afterAll(async () => {
    await rm(join(fixtureDir, '.nuxt'), { recursive: true, force: true })
  })

  it.each([
    [3, ['--isolate']],
    [1, ['--no-isolate']],
    [3, ['--isolate', '--browser.enabled']],
    [1, ['--no-isolate', '--browser.enabled']],
  ])('should run nuxt setup %i per worker with %s', async (expected, args) => {
    const result = await x('vitest', ['run', ...args, '--no-color', '.'], {
      nodeOptions: {
        cwd: fixtureDir,
      },
    })

    expect.assert(result.exitCode === 0, result.stderr)

    const setupCalls = result.stdout.split('### setupNuxt called ###').length - 1

    expect(setupCalls).toBe(expected)
  }, TEST_TIMEOUT)

  it.each([
    [2, ['--no-isolate'], 'before'],
    [2, ['--no-isolate'], 'after'],
    [2, ['--no-isolate', '--browser.enabled'], 'before'],
    [2, ['--no-isolate', '--browser.enabled'], 'after'],
  ])('should run nuxt setup %i per worker with %s (error %s setup completed)', async (expected, args, pattern) => {
    const result = await x('vitest', ['run', ...args, '--no-color', '.'], {
      nodeOptions: {
        cwd: fixtureDir,
        env: {
          ERROR_TEST_PATTERN: pattern,
        },
      },
    })

    expect.assert(result.exitCode === 1, result.stderr)
    expect(result.stderr).toContain(`#### setupNuxt failed ${pattern} ###`)

    const setupCalls = result.stdout.split('### setupNuxt called ###').length - 1

    expect(setupCalls).toBe(expected)

    expect(result.stderr).not.toContain('[Vue warn]: There is already an app instance mounted on the host container.')

    const testFileCount = args.includes('--browser.enabled') ? 3 : 4
    expect(result.stdout).toContain(`Test Files  1 failed | ${testFileCount - 1} passed`)
  }, TEST_TIMEOUT)
})
