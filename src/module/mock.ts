import type { Nuxt } from '@nuxt/schema'
import type { Unimport } from 'unimport'
import { resolveIgnorePatterns } from '@nuxt/kit'

import { createMockPlugin } from './plugins/mock'
import type { MockPluginContext } from './plugins/mock'
import { loadKit } from '../utils'

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

  const instanceId = Math.random().toString(36).substring(7)
  console.log(`[setupImportMocking] Creating instance ${instanceId}`)

  let importsCtx: Unimport
  let resolveImportsReady: () => void
  const importsReady = new Promise<void>((resolve) => {
    resolveImportsReady = resolve
  })

  nuxt.hook('imports:context', async (_ctx) => {
    importsCtx = _ctx
    console.log(`[setupImportMocking:${instanceId}] Got imports:context`)
  })

  // Ensure imports are populated before transforms can use them
  nuxt.hook('ready', async () => {
    if (importsCtx) {
      ctx.imports = await importsCtx.getImports()
      console.log(`[setupImportMocking:${instanceId}] Populated ${ctx.imports.length} imports in ready hook`)
    }
    else {
      console.error(`[setupImportMocking:${instanceId}] importsCtx is undefined in ready hook!`)
    }
    resolveImportsReady()
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

  addVitePlugin(createMockPlugin(ctx, importsReady).vite())
}
