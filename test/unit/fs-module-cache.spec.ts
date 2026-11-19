import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'
import { afterAll, describe, expect, it } from 'vitest'

const TEST_TIMEOUT = process.env.CI ? 180_000 : 90_000

const fixtureDir = fileURLToPath(new URL('../fixtures/fs-module-cache', import.meta.url))
const workDir = fileURLToPath(new URL('../fixtures-temp/fs-module-cache', import.meta.url))

async function replaceInFile(file: string, search: string, replacement: string) {
  const contents = await readFile(join(workDir, file), 'utf8')
  await writeFile(join(workDir, file), contents.replace(search, replacement))
}

describe('fs module cache', () => {
  const dirs: string[] = [workDir]

  afterAll(async () => {
    await Promise.all(dirs.map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('should invalidate cached modules when the nuxt config or local modules change', async () => {
    const cacheDir = await mkdtemp(join(tmpdir(), 'nuxt-test-utils-fs-cache-'))
    dirs.push(cacheDir)
    await rm(workDir, { recursive: true, force: true })
    await cp(fixtureDir, workDir, { recursive: true, filter: source => !source.endsWith('.nuxt') })

    const run = (env?: Record<string, string>) => x('vitest', ['run', '--fsModuleCache', '--fsModuleCachePath', cacheDir, '--no-color'], {
      nodeOptions: { cwd: workDir, env },
    })

    const first = await run()
    expect.assert(first.exitCode === 0, first.stdout + first.stderr)
    const cached = await readdir(cacheDir)
    expect(cached.length).toBeGreaterThan(1)

    const second = await run()
    expect.assert(second.exitCode === 0, second.stdout + second.stderr)
    expect(await readdir(cacheDir)).toEqual(cached)

    await replaceInFile('modules/bar/target.ts', `'one'`, `'two'`)
    const third = await run({ NUXT_TEST_BAR: 'two' })
    expect.assert(third.exitCode === 0, third.stdout + third.stderr)

    await replaceInFile('local-modules/baz.ts', 'targets/one', 'targets/two')
    const fourth = await run({ NUXT_TEST_BAR: 'two', NUXT_TEST_BAZ: 'two' })
    expect.assert(fourth.exitCode === 0, fourth.stdout + fourth.stderr)

    await replaceInFile('nuxt.config.ts', 'autoImport: true', 'autoImport: false')
    const fifth = await run({ NUXT_TEST_BAR: 'two', NUXT_TEST_BAZ: 'two' })
    expect(fifth.exitCode).toBe(1)
    expect(fifth.stdout + fifth.stderr).toContain('useFoo is not defined')
  }, TEST_TIMEOUT)
})
