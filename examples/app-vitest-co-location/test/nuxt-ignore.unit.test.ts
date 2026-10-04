import { relative } from 'pathe'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadNuxt, buildNuxt, logger } from '@nuxt/kit'

const TEST_TIMEOUT = process.env.CI ? 60_000 : 30_000

describe('nuxtignore', () => {
  const fixtureDir = fileURLToPath(new URL('../', import.meta.url))

  it('should ignore test files in runtime dirs', async () => {
    const nuxt = await loadNuxt({ cwd: fixtureDir })

    const normalize = (paths: string[]) => paths
      .map(p => relative(fixtureDir, p))
      .filter(p => !p.includes('node_modules/') && !p.includes('../') && !p.includes('.nuxt/'))
      .toSorted()

    const scans = {
      pages: [] as string[],
      imports: [] as string[],
      components: [] as string[],
      plugins: [] as string[],
      middlewares: [] as string[],
      serverHandlers: [] as string[],
    }

    nuxt.addHooks({
      'pages:extend'(pages) {
        scans.pages = normalize(pages.flatMap(p => p.file!))
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

    await buildNuxt(nuxt).finally(() => logger.restoreAll())

    expect(scans).toEqual({
      pages: [
        'app/pages/index.vue',
      ],
      imports: [
        'app/composables/useMessage.ts',
      ],
      components: [
        'app/components/Message.vue',
      ],
      plugins: [
        'app/plugins/message.ts',
      ],
      middlewares: [
        'app/middleware/logger.global.ts',
      ],
      serverHandlers: [
        'server/api/hello.get.ts',
      ],
    } satisfies typeof scans)
  }, TEST_TIMEOUT)
})
