import { relative } from 'pathe'
import { defineNuxtModule, addTemplate, addServerTemplate } from '@nuxt/kit'

export type TestCollectScans = ReturnType<typeof createScans>

function createScans() {
  return {
    pages: [] as string[],
    imports: [] as string[],
    components: [] as string[],
    plugins: [] as string[],
    middlewares: [] as string[],
    serverHandlers: [] as string[],
  }
}

export default defineNuxtModule({
  meta: {
    name: 'test-collect-scans',
  },
  setup(_, nuxt) {
    const rootDir = nuxt.options.rootDir

    const normalize = (paths: (string | undefined)[]) => paths
      .filter(p => p !== undefined)
      .map(p => relative(rootDir, p))
      .filter(p => !p.includes('node_modules/') && !p.includes('../') && !p.includes('.nuxt/'))
      .toSorted()

    const scans = createScans()

    addTemplate({
      filename: 'test-collect-scans.mjs',
      getContents: () => `export default ${JSON.stringify(scans)};`,
    })

    addServerTemplate({
      filename: '#test-collect-scans/scans.mjs',
      getContents: () => `export default ${JSON.stringify(scans)};`,
    })

    nuxt.addHooks({
      'pages:extend'(pages) {
        scans.pages = normalize(pages.map(p => p.file))
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
  },
})
