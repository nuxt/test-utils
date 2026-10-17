import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/runtime/shared/environment.ts', () => ({
  setupWindow: async () => () => {},
}))

describe('nuxt vitest environment', () => {
  const dirs: string[] = []

  afterEach(async () => {
    vi.restoreAllMocks()
    await Promise.all(dirs.map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('should set up and tear down when vitest cannot be resolved from cwd', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'nuxt-test-utils-env-'))
    dirs.push(cwd)
    vi.spyOn(process, 'cwd').mockReturnValue(cwd)

    const { default: environment } = await import('../../src/environments/vitest/index.ts')

    const originalFetch = () => {}
    const global: Record<string, unknown> = { fetch: originalFetch }
    const { teardown } = await environment.setup(global, {})
    expect(global.fetch).not.toBe(originalFetch)

    await teardown(global)
    expect(global.fetch).toBe(originalFetch)
  })
})
