import type { Nuxt, NuxtHooks } from '@nuxt/schema'
import { resolveIgnorePatterns } from '@nuxt/kit'

import { createMockPlugin } from './plugins/mock'
import type { MockPluginContext } from './plugins/mock'
import { loadKit } from '../utils'

function isTestPluginFile(src: string) {
  return (src.includes('.spec.') || src.includes('.test.'))
}

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
    const idx = presets.findIndex(p => 'imports' in p && p.imports?.includes('setInterval'))
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

  // But do not register test files inside plugins/ as real Nuxt plugins
  nuxt.hook('app:resolve', (app) => {
    app.plugins = app.plugins.filter(plugin => !isTestPluginFile(plugin.src))
  })

  addVitePlugin(createMockPlugin(ctx).vite())
}
