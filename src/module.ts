import { pathToFileURL } from 'node:url'
import { addVitePlugin, createResolver, defineNuxtModule, logger, resolvePath } from '@nuxt/kit'
import type { File, Reporter, Vitest, UserConfig as VitestConfig } from 'vitest'
import { mergeConfig } from 'vite'
import type { InlineConfig as ViteConfig } from 'vite'
import { getPort } from 'get-port-please'
import { h } from 'vue'
import { debounce } from 'perfect-debounce'
import { isCI } from 'std-env'
import { defu } from 'defu'

import { getVitestConfigFromNuxt } from './config'
import { setupImportMocking } from './module/mock'
import { NuxtRootStubPlugin } from './module/plugins/entry'

export interface NuxtVitestOptions {
  startOnBoot?: boolean
  logToConsole?: boolean
  vitestConfig?: VitestConfig
}

/**
 * List of plugins that are not compatible with test env.
 * Hard-coded for now, should remove by PR to upstream.
 */
const vitePluginBlocklist = ['vite-plugin-vue-inspector', 'vite-plugin-vue-inspector:post', 'vite-plugin-inspect', 'nuxt:type-check']

export default defineNuxtModule<NuxtVitestOptions>({
  meta: {
    name: '@nuxt/test-utils',
    configKey: 'testUtils',
  },
  defaults: {
    startOnBoot: false,
    logToConsole: false,
  },
  async setup(options, nuxt) {
    if (nuxt.options.test || nuxt.options.dev) {
      setupImportMocking()
    }

    const resolver = createResolver(import.meta.url)
    addVitePlugin(NuxtRootStubPlugin.vite({
      entry: await resolvePath('#app/entry', { alias: nuxt.options.alias }),
      rootStubPath: await resolvePath(resolver.resolve('./runtime/nuxt-root')),
    }))

    // Support for in-source testing
    if (!nuxt.options.test && !nuxt.options.dev) {
      nuxt.options.vite.define ||= {}
      nuxt.options.vite.define['import.meta.vitest'] = 'undefined'
    }

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ types: 'vitest/import-meta' })
    })

    if (!nuxt.options.dev) return

    // the nuxt instance is used by a standalone Vitest env, we skip this module
    if (process.env.TEST || process.env.VITE_TEST) return

    const rawViteConfigPromise = new Promise<ViteConfig>((resolve) => {
      // Wrap with app:resolve to ensure we got the final vite config
      nuxt.hook('app:resolve', () => {
        nuxt.hook('vite:configResolved', (config, { isClient }) => {
          if (isClient) resolve(config)
        })
      })
    })

    let loaded = false
    let promise: Promise<void> | undefined
    let ctx: Vitest = undefined!
    let testFiles: File[] | null = null

    const updateTabs = debounce(() => {
      nuxt.callHook('devtools:customTabs:refresh')
    }, 100)

    let URL: string

    async function start() {
      const rawViteConfig = mergeConfig({}, await rawViteConfigPromise)

      const viteConfig = await getVitestConfigFromNuxt({ nuxt, viteConfig: defu({ test: options.vitestConfig }, rawViteConfig) })

      viteConfig.plugins = (viteConfig.plugins || []).filter((p) => {
        return !p || !('name' in p) || !vitePluginBlocklist.includes(p.name)
      })

      process.env.__NUXT_VITEST_RESOLVED__ = 'true'
      const { startVitest } = (await import(pathToFileURL(await resolvePath('vitest/node')).href)) as typeof import('vitest/node')

      const customReporter: Reporter = {
        onInit(_ctx) {
          ctx = _ctx
        },
        onTaskUpdate() {
          testFiles = ctx.state.getFiles()
          updateTabs()
        },
        onFinished() {
          testFiles = ctx.state.getFiles()
          updateTabs()
        },
      }

      const watchMode = !process.env.NUXT_VITEST_DEV_TEST && !isCI

      // We resolve the path here to ensure the dev server is already running with the correct protocol
      const PORT = await getPort({ port: 15555 })
      const PROTOCOL = nuxt.options.devServer.https ? 'https' : 'http'
      URL = `${PROTOCOL}://localhost:${PORT}/__vitest__/`

      // For testing dev mode in CI, maybe expose an option to user later
      const overrides: VitestConfig = watchMode
        ? {
            passWithNoTests: true,
            reporters: options.logToConsole
              ? [
                  ...toArray(options.vitestConfig?.reporters ?? ['default']),
                  customReporter,
                ]
              : [customReporter], // do not report to console
            watch: true,
            ui: true,
            open: false,
            api: {
              port: PORT,
            },
          }
        : { watch: false }

      // Start Vitest
      const promise = startVitest('test', [], defu(overrides, viteConfig.test), viteConfig)
      promise.catch(() => process.exit(1))

      if (watchMode) {
        logger.info(`Vitest UI starting on ${URL}`)
        nuxt.hook('close', () => promise.then(v => v?.close()))
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      else {
        promise.then(v => nuxt.close().then(() => v?.close()).then(() => process.exit()))
      }

      loaded = true
    }

    nuxt.hook('devtools:customTabs', (tabs) => {
      const failedCount
        = testFiles?.filter(f => f.result?.state === 'fail').length ?? 0
      const passedCount
        = testFiles?.filter(f => f.result?.state === 'pass').length ?? 0
      const totalCount = testFiles?.length ?? 0

      tabs.push({
        title: 'Vitest',
        name: 'vitest',
        icon: 'logos-vitest',
        view: loaded
          ? {
              type: 'iframe',
              src: URL,
            }
          : {
              type: 'launch',
              description: 'Start tests along with Nuxt',
              actions: [
                {
                  label: promise ? 'Starting...' : 'Start Vitest',
                  pending: !!promise,
                  handle: () => {
                    promise = promise || start()
                    return promise
                  },
                },
              ],
            },
        extraTabVNode: totalCount
          ? h('div', { style: { color: failedCount ? 'orange' : 'green' } }, [
            h('span', {}, passedCount),
            h('span', { style: { opacity: '0.5', fontSize: '0.9em' } }, '/'),
            h(
              'span',
              { style: { opacity: '0.8', fontSize: '0.9em' } },
              totalCount,
            ),
          ])
          : undefined,
      })
    })

    if (options.startOnBoot) {
      promise = promise || start()
      promise.then(updateTabs)
    }
  },
})

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}
