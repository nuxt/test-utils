import type { Unimport } from 'unimport'
import { addVitePlugin, useNuxt } from '@nuxt/kit'

import { createMockPlugin } from './plugins/mock'
import type { MockPluginContext } from './plugins/mock'

/**
 * This module is a macro that transforms `mockNuxtImport()` to `vi.mock()`,
 * which make it possible to mock Nuxt imports.
 */
export function setupImportMocking () {
  const nuxt = useNuxt()

  const ctx: MockPluginContext = {
    components: [],
    imports: []
  }
  
  let importsCtx: Unimport
  nuxt.hook('imports:context', async ctx => {
    importsCtx = ctx
  })
  nuxt.hook('ready', async () => {
    ctx.imports = await importsCtx.getImports()
  })

  nuxt.hook('components:extend', _ => {
    ctx.components = _
  })

  addVitePlugin(createMockPlugin(ctx).vite())
}
