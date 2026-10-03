import { relative, join } from 'pathe'
import { fileURLToPath } from 'node:url'
import { rm } from 'node:fs/promises'
import { afterAll, describe, expect, it } from 'vitest'
import { loadNuxt, buildNuxt, logger } from '@nuxt/kit'
import { setupNuxtIgnore } from '../../src/module/ignore'

const TEST_TIMEOUT = process.env.CI ? 60_000 : 30_000

describe('nuxtignore', () => {
  const fixtureDir = fileURLToPath(new URL('../fixtures/nuxt-ignore', import.meta.url))

  afterAll(async () => {
    await rm(join(fixtureDir, '.nuxt'), { recursive: true, force: true })
  })

  it('should remove test file pattern from ignore', async () => {
    const nuxt = await loadNuxt({
      cwd: fixtureDir,
    })

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

  it('should ignore test files in runtime dirs', async () => {
    const nuxt = await loadNuxt({ cwd: fixtureDir })

    const normalize = (paths: string[]) => paths
      .map(p => relative(fixtureDir, p))
      .filter(p => !p.includes('node_modules/') && !p.includes('../') && !p.includes('.nuxt/'))
      .toSorted()

    const scans = {
      pages: [] as string[],
      imports: [] as string[],
      components: [] as string[],
      plugins: [] as string[],
      middlewares: [] as string[],
      serverHandlers: [] as string[],
    }

    nuxt.addHooks({
      'pages:extend'(pages) {
        scans.pages = normalize(pages.flatMap(p => p.file!))
      },
      'imports:extend'(imports) {
        scans.imports = normalize(imports.map(p => p.from))
      },
      'components:extend'(components) {
        scans.components = normalize(components.map(p => p.filePath))
      },
      'app:resolve': (app) => {
        scans.plugins = normalize(app.plugins.map(p => p.src))
        scans.middlewares = normalize(app.middleware.map(p => p.path))
      },
      'nitro:build:before'(nitro) {
        scans.serverHandlers = normalize(nitro.scannedHandlers.map(p => p.handler))
      },
    })

    await buildNuxt(nuxt).finally(() => logger.restoreAll())

    expect(scans).toEqual({
      pages: [
        'app/pages/index.vue',
      ],
      imports: [
        'app/composables/useMessage.ts',
      ],
      components: [
        'app/components/Message.vue',
      ],
      plugins: [
        'app/plugins/message.ts',
      ],
      middlewares: [
        'app/middleware/logger.global.ts',
      ],
      serverHandlers: [
        'server/api/hello.get.ts',
      ],
    } satisfies typeof scans)
  }, TEST_TIMEOUT)
})
