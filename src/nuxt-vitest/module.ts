import { pathToFileURL } from 'node:url'
import { defineNuxtModule, installModule, logger, resolvePath } from '@nuxt/kit'
import type { UserConfig as VitestConfig, Reporter, Vitest, File } from 'vitest'
import { mergeConfig, InlineConfig as ViteConfig } from 'vite'
import { getVitestConfigFromNuxt } from './config'
import { getPort } from 'get-port-please'
import { h } from 'vue'
import { debounce } from 'perfect-debounce'
import { isCI } from 'std-env'

export interface NuxtVitestOptions {
  startOnBoot?: boolean
  logToConsole?: boolean
  vitestConfig?: VitestConfig
}

/**
 * List of plugins that are not compatible with text env.
 * Hard-coded for now, should remove by PR to upstream.
 */
const vitePluginBlocklist = ['vite-plugin-vue-inspector', 'vite-plugin-inspect']

export default defineNuxtModule<NuxtVitestOptions>({
  meta: {
    name: 'nuxt-vitest',
    configKey: 'vitest',
  },
  defaults: {
    startOnBoot: false,
    logToConsole: false,
  },
  async setup(options, nuxt) {
    await installModule('vitest-environment-nuxt/module')

    if (!nuxt.options.dev) return

    if (nuxt.options.test && nuxt.options.app.rootId === '__nuxt') {
      nuxt.options.app.rootId = 'nuxt-test'
    }

    // the nuxt instance is used by a standalone Vitest env, we skip this module
    if (process.env.TEST || process.env.VITE_TEST) return

    const rawViteConfigPromise = new Promise<ViteConfig>(resolve => {
      // Wrap with app:resolve to ensure we got the final vite config
      nuxt.hook('app:resolve', () => {
        nuxt.hook('vite:extendConfig', (config, { isClient }) => {
          if (isClient) resolve(config)
        })
      })
    })

    const PORT = await getPort({ port: 15555 })
    const URL = `http://localhost:${PORT}/__vitest__/`
    let loaded = false
    let promise: Promise<any> | undefined
    let ctx: Vitest = undefined!
    let testFiles: File[] | null = null

    const updateTabs = debounce(() => {
      nuxt.callHook('devtools:customTabs:refresh')
    }, 100)

    async function start() {
      const rawViteConfig = mergeConfig({}, await rawViteConfigPromise)

      const viteConfig = mergeConfig(
        await getVitestConfigFromNuxt({ nuxt, viteConfig: rawViteConfig }),
        <ViteConfig>{
          server: {
            middlewareMode: false,
          },
        }
      )

      viteConfig.plugins = (viteConfig.plugins || []).filter((p: any) => {
        return !vitePluginBlocklist.includes(p?.name)
      })

      process.env.__NUXT_VITEST_RESOLVED__ = 'true'
      const { startVitest } = (await import(
        pathToFileURL(await resolvePath('vitest/node')).href
      )) as typeof import('vitest/node')

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

      // For testing dev mode in CI, maybe expose an option to user later
      const vitestConfig: VitestConfig = watchMode
        ? {
            passWithNoTests: true,
            ...options.vitestConfig,
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
        : {
            ...options.vitestConfig,
            watch: false,
          }

      // TODO: Investigate segfault when loading config file in Nuxt
      viteConfig.configFile = false

      // Start Vitest
      const promise = startVitest('test', [], vitestConfig, viteConfig)
      promise.catch(() => process.exit(1))

      if (watchMode) {
        logger.info(`Vitest UI starting on ${URL}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        promise.then(v => v?.close()).then(() => process.exit())
        promise.catch(() => process.exit(1))
      }

      loaded = true
    }

    // @ts-ignore
    nuxt.hook('devtools:customTabs', tabs => {
      const failedCount =
        testFiles?.filter(f => f.result?.state === 'fail').length ?? 0
      const passedCount =
        testFiles?.filter(f => f.result?.state === 'pass').length ?? 0
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
                totalCount
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
