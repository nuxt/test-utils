import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Nuxt, NuxtHookName } from 'nuxt/schema'
import { setupNuxtIgnore } from '../../src/module/ignore'

const { resolveIgnorePatterns } = vi.hoisted(() => ({
  resolveIgnorePatterns: vi.fn(() => [] as string[]),
}))

vi.mock(import('@nuxt/kit'), async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    resolveIgnorePatterns,
  }
})

type Hook = (...args: unknown[]) => unknown
let hooks: Record<NuxtHookName, Hook[]>

function createNuxt() {
  hooks = {} as typeof hooks
  const nuxt = {
    hook: (name: NuxtHookName, fn: Hook) => {
      (hooks[name] ||= []).push(fn)
    },
    options: {},
  } as Nuxt
  nuxt.options.ignore = []
  return nuxt
}

describe('nuxtignore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolveIgnorePatterns.mockImplementation(() => [])
  })

  it('should remove test file patterns from `nuxt.options.ignore`', () => {
    const nuxt = createNuxt()

    nuxt.options.ignore = [
      '**/*.stories.{js,cts,mts,ts,jsx,tsx}',
      '**/*.d.{cts,mts,ts}',
      '!**/pages/hide/__tests__/**',
      '!**/pages/**/this-is-page.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      '!**/components/**/this-is-components.spec.ts',
      '**/*.latest.ts',
      '**/*.testing.ts',
      '**/*.special.ts',
      '**/*.inspect.ts',
      '**/*.spec.tsxp',
      '**/*.{latest,other}.ts',
      '**/__tests__/**/*',
      '**/*.spec.js',
      '**/*.spec.mjs',
      '**/*.spec.cjs',
      '**/*.spec.jsx',
      '**/*.spec.ts',
      '**/*.spec.mts',
      '**/*.spec.cts',
      '**/*.spec.tsx',
      '**/*.test.js',
      '**/*.test.mjs',
      '**/*.test.cjs',
      '**/*.test.jsx',
      '**/*.test.ts',
      '**/*.test.mts',
      '**/*.test.cts',
      '**/*.test.tsx',
      '**/*.spec-d.ts',
      '**/*.test-d.ts',
      '**/*.{spec,test}.ts',
      '**/*.{test-d,spec-d}.ts',
      '**/*.spec.{js,cts,mts,ts,jsx,tsx}',
      '**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      '**/*.{spec,test,spec-d,test-d}.{js,cts,mts,ts,jsx,tsx}',
    ]

    setupNuxtIgnore(nuxt)
    expect(nuxt.options.ignore).toEqual([
      '**/*.stories.{js,cts,mts,ts,jsx,tsx}',
      '**/*.d.{cts,mts,ts}',
      '!**/pages/hide/__tests__/**',
      '!**/pages/**/this-is-page.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      '!**/components/**/this-is-components.spec.ts',
      '**/*.latest.ts',
      '**/*.testing.ts',
      '**/*.special.ts',
      '**/*.inspect.ts',
      '**/*.spec.tsxp',
      '**/*.{latest,other}.ts',
    ])
  })

  it('should add negative test file patterns to `nuxt._ignore`', async () => {
    resolveIgnorePatterns.mockImplementationOnce(() => [
      '**/*.stories.{js,cts,mts,ts,jsx,tsx}',
      '**/*.d.{cts,mts,ts}',
      '**/__tests__/**',
      '**/*.{spec,test}.ts',
      '**/*.{test-d,spec-d}.ts',
      '**/*.spec.{js,cts,mts,ts,jsx,tsx}',
      '**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      '**/*.{spec,test,spec-d,test-d}.{js,cts,mts,ts,jsx,tsx}',
      '!**/pages/__tests__/**',
      '!**/pages/**/this-is-page.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      '!**/components/**/this-is-components.spec.ts',
    ])

    const addedNegativeIgnores = [] as string[]

    const nuxt = createNuxt()
    nuxt._ignore = {
      add: (p: string) => {
        addedNegativeIgnores.push(p)
      },
    } as typeof nuxt._ignore

    setupNuxtIgnore(nuxt)
    hooks['modules:done'].at(-1)?.()

    expect(addedNegativeIgnores).toEqual([
      '!**/__tests__/**',
      '!**/*.{spec,test}.ts',
      '!**/*.{test-d,spec-d}.ts',
      '!**/*.spec.{js,cts,mts,ts,jsx,tsx}',
      '!**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}',
      '!**/*.{spec,test,spec-d,test-d}.{js,cts,mts,ts,jsx,tsx}',
    ])
  })

  it('should remove test files from plugins', () => {
    const nuxt = createNuxt()
    const app = {
      plugins: [
        'app/plugins/plugin.ts',
        'app/plugins/plugin.spec.ts',
        'app/plugins/plugin.test.ts',
        'app/plugins/plugin.spec-d.ts',
        'app/plugins/plugin.test-d.ts',
        'app/plugins/plugin.special.ts',
        'app/plugins/plugin.testable.ts',
      ].map(src => ({ src })),
    }

    setupNuxtIgnore(nuxt)
    hooks['app:resolve'].at(-1)?.(app)

    expect(app.plugins.map(({ src }) => src)).toEqual([
      'app/plugins/plugin.ts',
      'app/plugins/plugin.special.ts',
      'app/plugins/plugin.testable.ts',
    ])
  })
})
