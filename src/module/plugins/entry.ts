import { readFileSync } from 'node:fs'
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
      async resolveId(id) {
        if (id.endsWith('nuxt-vitest-app-entry')) {
          return id
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
