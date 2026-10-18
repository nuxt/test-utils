import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'
import { afterAll, describe, expect, it } from 'vitest'

const TEST_TIMEOUT = process.env.CI ? 60_000 : 30_000

const fixtureDir = fileURLToPath(new URL('../fixtures/vitest-environment', import.meta.url))

describe('nuxt vitest environment', () => {
  const dirs: string[] = []

  afterAll(async () => {
    await Promise.all(dirs.map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('should run when vitest cannot be resolved from cwd', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'nuxt-test-utils-env-'))
    dirs.push(cwd)

    const result = await x('vitest', ['run', '--root', fixtureDir, '--no-color'], {
      nodeOptions: { cwd },
    })

    expect.assert(result.exitCode === 0, result.stderr)
    expect(result.stdout).toContain('1 passed')
  }, TEST_TIMEOUT)
})
