import type { Unimport } from 'unimport'
import { addVitePlugin, resolveIgnorePatterns, useNuxt } from '@nuxt/kit'

import { createMockPlugin } from './plugins/mock'
import type { MockPluginContext } from './plugins/mock'

/**
 * This module is a macro that transforms `mockNuxtImport()` to `vi.mock()`,
 * which make it possible to mock Nuxt imports.
 */
export function setupImportMocking() {
  const nuxt = useNuxt()

  const ctx: MockPluginContext = {
    components: [],
    imports: [],
  }

  let importsCtx: Unimport
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
    const idx = presets.findIndex(p => p.imports?.includes('setInterval'))
    if (idx !== -1) {
      presets.splice(idx, 1)
    }
  })

  // We want to run Nuxt plugins on test files
  nuxt.options.ignore = nuxt.options.ignore.filter(i => i !== '**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}')
  if (nuxt._ignore) {
    for (const pattern of resolveIgnorePatterns('**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}')) {
      nuxt._ignore.add(`!${pattern}`)
    }
  }

  addVitePlugin(createMockPlugin(ctx).vite())
}
