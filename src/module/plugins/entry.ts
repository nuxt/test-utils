import { readFileSync } from 'node:fs'
import { dirname, join } from 'pathe'
import { createUnplugin } from "unplugin"

const PLUGIN_NAME = 'nuxt:vitest:nuxt-root-stub'

interface NuxtRootStubPluginOptions {
  entry: string
  rootStubPath: string
}

export const NuxtRootStubPlugin = createUnplugin((options: NuxtRootStubPluginOptions) => {
  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    vite: {
      async resolveId(id, importer) {
        if (id.endsWith('nuxt-vitest-app-entry')) {
          return importer?.endsWith('index.html') ? id : join(dirname(options.entry), 'nuxt-vitest-app-entry')
        }
      },
      async load(id) {
        if (id.endsWith('nuxt-vitest-app-entry')) {
          const entryContents = readFileSync(options.entry, 'utf-8')
          return entryContents.replace('#build/root-component.mjs', options.rootStubPath)
        }
      }
    },
  }
})
