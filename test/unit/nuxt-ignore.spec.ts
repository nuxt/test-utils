import { describe, expect, it } from 'vitest'
import type { Nuxt } from 'nuxt/schema'
import { setupNuxtIgnore } from '../../src/module/ignore'

type Hook = (...args: unknown[]) => unknown
let hooks: Record<string, Hook[]>

function createNuxt() {
  hooks = {}
  const nuxt = {
    hook: (name: string, fn: Hook) => {
      (hooks[name] ||= []).push(fn)
    },
    options: {},
  } as Nuxt
  nuxt.options.ignore = []
  return nuxt
}

describe('nuxtignore', () => {
  it('should remove test file pattern from ignore', async () => {
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

  it('should remove test files from plugins', async () => {
    const nuxt = createNuxt()
    setupNuxtIgnore(nuxt)
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
    hooks['app:resolve']?.at(-1)?.(app)
    expect(app.plugins.map(({ src }) => src)).toEqual([
      'app/plugins/plugin.ts',
      'app/plugins/plugin.special.ts',
      'app/plugins/plugin.testable.ts',
    ])
  })
})
