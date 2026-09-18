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
    [[]],
    [['--browser.enabled']],
  ])('should call nuxt setup once per test file with --isolate %s', async (args) => {
    const result = await x('vitest', ['run', ...args, '--isolate', '--no-color', '.'], {
      nodeOptions: {
        cwd: fixtureDir,
      },
    })

    expect.assert(result.exitCode === 0, result.stderr)

    expect(collectSetupCalls(result.stdout).total).toBe(3)
  }, TEST_TIMEOUT)

  it.each([
    [1, []],
    [2, []],
    [1, ['--browser.enabled']],
    [2, ['--browser.enabled']],
  ])('should call nuxt setup once per worker with --no-isolate --maxWorkers=%d %s', async (maxWorkers, args = []) => {
    const result = await x('vitest', [
      'run', ...args, '--no-isolate', `--maxWorkers=${maxWorkers}`, '--no-color', '.',
    ], {
      nodeOptions: {
        cwd: fixtureDir,
      },
    })

    expect.assert(result.exitCode === 0, result.stderr)

    const setupCalls = collectSetupCalls(result.stdout)
    expect(setupCalls.total).not.toBe(0)
    expect(setupCalls.total).toBe(setupCalls.byWorker.size)
    expect(setupCalls.byWorker.values().every(c => c === 1)).toBe(true)
  }, TEST_TIMEOUT)

  it.each([
    [2, [], 'before'],
    [2, [], 'after'],
    [2, ['--browser.enabled'], 'before'],
    [2, ['--browser.enabled'], 'after'],
  ])('should call nuxt setup %i times total with --no-isolate %s when failing %s setup', async (expected, args, pattern) => {
    const result = await x('vitest', [
      'run', ...args, '--no-isolate', '--no-color', '.',
    ], {
      nodeOptions: {
        cwd: fixtureDir,
        env: {
          ERROR_TEST_PATTERN: pattern,
        },
      },
    })

    expect.assert(result.exitCode === 1, result.stderr)

    expect(result.stderr).toContain(`#### setupNuxt failed ${pattern} ###`)
    expect(collectSetupCalls(result.stdout).total).toBe(expected)
    expect(result.stderr).not.toContain('[Vue warn]: There is already an app instance mounted on the host container.')

    const testFileCount = args.includes('--browser.enabled') ? 3 : 4
    expect(result.stdout).toContain(`Test Files  1 failed | ${testFileCount - 1} passed`)
  }, TEST_TIMEOUT)

  function collectSetupCalls(stdout: string) {
    const setupCalls = [...stdout.matchAll(/### setupNuxt called ### (\d+):(\w+)/g)]
    const collectResult = {
      total: 0,
      byWorker: new Map<string, number>(),
    }
    for (const setupCall of setupCalls) {
      collectResult.total += 1
      const workerId = setupCall[2]!
      collectResult.byWorker.set(workerId, (collectResult.byWorker.get(workerId) ?? 0) + 1)
    }
    return collectResult
  }
})
