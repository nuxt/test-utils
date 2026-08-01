import { readFileSync } from 'node:fs'
import { dirname, extname, join } from 'pathe'
import type { Plugin } from 'vite'

const PLUGIN_NAME = 'nuxt:vitest:nuxt-root-stub'

interface NuxtRootStubPluginOptions {
  entry: string
  rootStubPath: string
}

const STUB_ID = 'nuxt-vitest-app-entry'

export const NuxtRootStubPlugin = (options: NuxtRootStubPluginOptions): Plugin => {
  const extension = extname(options.entry)
  const escapedExt = extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const entryPath = join(dirname(options.entry), STUB_ID + extension)
  const idFilter = new RegExp(`${STUB_ID}(?:${escapedExt})?$`)

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    resolveId: {
      filter: {
        id: idFilter,
      },
      async handler(id, importer) {
        return importer?.endsWith('index.html') ? id : entryPath
      },
    },
    load: {
      filter: {
        id: idFilter,
      },
      async handler() {
        const entryContents = readFileSync(options.entry, 'utf-8')
        return entryContents.replace('#build/root-component.mjs', options.rootStubPath)
      },
    },
  }
}
