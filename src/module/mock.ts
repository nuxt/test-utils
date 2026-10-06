import type { Nuxt, NuxtHooks } from '@nuxt/schema'
import { resolveIgnorePatterns } from '@nuxt/kit'

import { createMockPlugin } from './plugins/mock.ts'
import type { MockPluginContext } from './plugins/mock.ts'
import { loadKit } from '../utils.ts'

/**
 * This module is a macro that transforms `mockNuxtImport()` to `vi.mock()`,
 * which make it possible to mock Nuxt imports.
 */
export async function setupImportMocking(nuxt: Nuxt) {
  const { addVitePlugin } = await loadKit(nuxt.options.rootDir)
  const ctx: MockPluginContext = {
    components: [],
    imports: [],
  }

  let importsCtx: Parameters<NuxtHooks['imports:context']>[0]
  nuxt.hook('imports:context', async (ctx) => {
    importsCtx = ctx
  })
  nuxt.hook('ready', async () => {
    ctx.imports = await importsCtx.getImports()
  })

  nuxt.hook('components:extend', (_) => {
    ctx.components = _
  })

  nuxt.hook('imports:sources', (presets) => {
    // because the native setInterval cannot be mocked
    const idx = presets.findIndex(p => typeof p === 'object' && 'imports' in p && p.imports?.includes('setInterval'))
    if (idx !== -1) {
      presets.splice(idx, 1)
    }
  })

  const ignorePatterns: string[] = []
  nuxt.hook('vite:configResolved', (_, { isClient }) => {
    if (!isClient) return
    ignorePatterns.push(...resolveIgnorePatterns())
  })
  addVitePlugin({
    name: 'nuxt:vitest:un-ignore-for-testing',
    configureVitest() {
      // We want to run Nuxt plugins on test files, so un-ignore all patterns
      for (const pattern of new Set(ignorePatterns)) {
        if (pattern.startsWith('!')) continue
        nuxt._ignore?.add(`!${pattern}`)
      }
    },
  })

  addVitePlugin(createMockPlugin(ctx).vite())
}
