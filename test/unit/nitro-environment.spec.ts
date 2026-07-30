import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Plugin } from 'vite'

const loadNuxt = vi.fn()
const nitroClose = vi.fn(() => Promise.resolve())

vi.mock('../../src/utils.ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/utils.ts')>()
  return {
    ...original,
    loadKit: () => Promise.resolve({ loadNuxt, buildNuxt } as unknown as typeof import('@nuxt/kit')),
  }
})

const { getVitestConfigFromNuxt } = await import('../../src/config.ts')

type Hook = (...args: unknown[]) => unknown
let hooks: Record<string, Hook[]>

function createNuxt() {
  hooks = {}
  return {
    hook: (name: string, fn: Hook) => {
      (hooks[name] ||= []).push(fn)
    },
    close: vi.fn(),
    options: {
      appDir: process.cwd(),
      modulesDir: [process.cwd()],
      rootDir: process.cwd(),
      runtimeConfig: { app: {} },
      routeRules: {},
      nitro: {},
      app: { rootAttrs: {}, rootTag: 'div', teleportAttrs: {}, teleportTag: 'div' },
      build: { transpile: [] },
      _installedModules: [{ meta: { name: '@nuxt/test-utils' } }],
    },
  }
}

async function buildNuxt() {
  for (const hook of hooks['nitro:init'] || []) {
    await hook({ hooks: { callHook: nitroClose } })
  }
  for (const hook of hooks['vite:configResolved'] || []) {
    await hook({ plugins: [] }, { isClient: true })
  }
}

describe('nitro vite environment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadNuxt.mockImplementation(() => Promise.resolve(createNuxt()))
  })

  it('should disable the nitro vite environment by default', async () => {
    await getVitestConfigFromNuxt(undefined, {})

    const options = loadNuxt.mock.calls[0]![0]
    expect(options.dev).toBe(false)
    expect(options.overrides.experimental.nitroViteEnvironment).toBe(false)
  })

  it('should allow the user to re-enable the nitro vite environment', async () => {
    await getVitestConfigFromNuxt(undefined, {
      overrides: { experimental: { nitroViteEnvironment: true } } as Record<string, unknown>,
    })

    expect(loadNuxt.mock.calls[0]![0].overrides.experimental.nitroViteEnvironment).toBe(true)
  })

  it('should keep the nitro environment and close nitro once on teardown', async () => {
    const config = await getVitestConfigFromNuxt(undefined, { nitroEnvironment: true })

    const options = loadNuxt.mock.calls[0]![0]
    expect(options.dev).toBe(true)
    expect(options.overrides.experimental?.nitroViteEnvironment).toBeUndefined()

    const plugin = (config.plugins as Plugin[]).find(p => p && 'name' in p && p.name === 'nuxt:test-utils:nitro-teardown')
    expect(plugin).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const closeBundle = plugin!.closeBundle as any
    await closeBundle.call({})
    await closeBundle.call({})
    expect(nitroClose).toHaveBeenCalledTimes(1)
    expect(nitroClose).toHaveBeenCalledWith('close')
  })
})
