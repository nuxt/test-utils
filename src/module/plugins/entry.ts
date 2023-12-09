import { readFileSync } from 'node:fs'
import { dirname, extname, join } from 'pathe'
import { createUnplugin } from "unplugin"

const PLUGIN_NAME = 'nuxt:vitest:nuxt-root-stub'

interface NuxtRootStubPluginOptions {
  entry: string
  rootStubPath: string
}

const STUB_ID = 'nuxt-vitest-app-entry'

export const NuxtRootStubPlugin = createUnplugin((options: NuxtRootStubPluginOptions) => {
  const STUB_ID_WITH_EXT = STUB_ID + extname(options.entry)

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    vite: {
      async resolveId(id, importer) {
        if (id.endsWith(STUB_ID) || id.endsWith(STUB_ID_WITH_EXT)) {
          return importer?.endsWith('index.html') ? id : join(dirname(options.entry), STUB_ID_WITH_EXT)
        }
      },
      async load(id) {
        if (id.endsWith(STUB_ID) || id.endsWith(STUB_ID_WITH_EXT)) {
          const entryContents = readFileSync(options.entry, 'utf-8')
          return entryContents.replace('#build/root-component.mjs', options.rootStubPath)
        }
      }
    },
  }
})
