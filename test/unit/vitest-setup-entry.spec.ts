import { x } from 'tinyexec'
import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

const TEST_TIMEOUT = process.env.CI ? 60_000 : 30_000

const fixtureDir = fileURLToPath(new URL('../fixtures/isolate-setup', import.meta.url))

describe('output console', () => {
  afterAll(async () => {
    await rm(join(fixtureDir, '.nuxt'), { recursive: true, force: true })
  })

  it.each([
    [3, ['--isolate']],
    [1, ['--no-isolate']],
    [2, ['--isolate', '--browser.enabled']],
    [1, ['--no-isolate', '--browser.enabled']],
  ])('should run nuxt setup %i per worker with %s', async (expected, args) => {
    const result = await x('vitest', ['run', ...args], {
      nodeOptions: {
        cwd: fixtureDir,
      },
    })

    expect.assert(result.exitCode === 0, result.stderr)

    const setupCalls = result.stdout.split('### plugin imported ###').length - 1

    expect(setupCalls).toBe(expected)
  }, TEST_TIMEOUT)
})
