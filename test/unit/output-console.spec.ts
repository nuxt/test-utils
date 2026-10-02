import { x } from 'tinyexec'
import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

const TEST_TIMEOUT = process.env.CI ? 60_000 : 30_000

const fixtureDir = fileURLToPath(new URL('../fixtures/output-console', import.meta.url))

describe('output console', () => {
  afterAll(async () => {
    await rm(join(fixtureDir, '.nuxt'), { recursive: true, force: true })
  })

  it('should output console messages to vitest', async () => {
    const result = await x('vitest', ['run'], {
      nodeOptions: {
        cwd: fixtureDir,
      },
    })

    expect.assert(result.exitCode === 0, result.stderr)

    expect(result.stdout).toContain('=== beforeAll info ===')
    expect(result.stderr).toContain('=== beforeAll error ===')

    expect(result.stdout).toContain('=== beforeEach info ===')
    expect(result.stderr).toContain('=== beforeEach error ===')

    expect(result.stdout).toContain('=== test1 info ===')
    expect(result.stderr).toContain('=== test1 error ===')

    expect(result.stdout).toContain('=== test1 info ===')
    expect(result.stderr).toContain('=== test1 error ===')
  }, TEST_TIMEOUT)
})
