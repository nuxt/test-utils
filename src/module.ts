/// <reference types="@nuxt/devtools-kit" />

import { pathToFileURL } from 'node:url'
import { createResolver, defineNuxtModule, logger, resolvePath } from '@nuxt/kit'
import type { Vitest, UserConfig as VitestConfig } from 'vitest/node'
import type { Reporter } from 'vitest/reporters'
import type { RunnerTestFile } from 'vitest'
import { getPort } from 'get-port-please'
import { h } from 'vue'
import { debounce } from 'perfect-debounce'
import { isCI } from 'std-env'
import { join, relative } from 'pathe'

import { setupImportMocking } from './module/mock'
import { NuxtRootStubPlugin } from './module/plugins/entry'
import { loadKit } from './utils'

export interface NuxtVitestOptions {
  startOnBoot?: boolean
  logToConsole?: boolean
  vitestConfig?: VitestConfig
}

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
      await setupImportMocking(nuxt)
    }

    const { addVitePlugin, loadNuxt } = await loadKit(nuxt.options.rootDir)

    const resolver = createResolver(import.meta.url)
    if (nuxt.options.test || nuxt.options.dev) {
      addVitePlugin(NuxtRootStubPlugin({
        entry: await resolvePath('#app/entry', { alias: nuxt.options.alias }),
        rootStubPath: await resolvePath(resolver.resolve('./runtime/nuxt-root')),
      }))
    }

    // Support for in-source testing
    if (!nuxt.options.test && !nuxt.options.dev) {
      nuxt.options.vite.define ||= {}
      nuxt.options.vite.define['import.meta.vitest'] = 'undefined'
    }

    nuxt.hook('prepare:types', (ctx) => {
      ctx.references.push({ types: 'vitest/import-meta' })
      if (ctx.nodeTsConfig) {
        ctx.nodeTsConfig.include ||= []
        ctx.nodeTsConfig.include.push(relative(nuxt.options.buildDir, join(nuxt.options.rootDir, 'vitest.config.*')))
        if (nuxt.options.workspaceDir !== nuxt.options.rootDir) {
          ctx.nodeTsConfig.include.push(relative(nuxt.options.buildDir, join(nuxt.options.workspaceDir, 'vitest.config.*')))
        }
      }
    })

    if (!nuxt.options.dev) return

    // the nuxt instance is used by a standalone Vitest env, we skip this module
    if (process.env.TEST || process.env.VITE_TEST) return

    let loaded = false
    let promise: Promise<void> | undefined
    let ctx: Vitest = undefined!
    let testFiles: RunnerTestFile[] | null = null

    const updateTabs = debounce(() => {
      nuxt.callHook('devtools:customTabs:refresh')
    }, 100)

    let URL: string

    async function start() {
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

      const watchMode = !isCI

      // We resolve the path here to ensure the dev server is already running with the correct protocol
      const PORT = await getPort({ port: 15555 })
      const PROTOCOL = nuxt.options.devServer.https ? 'https' : 'http'
      URL = `${PROTOCOL}://localhost:${PORT}/__vitest__/`

      // Start Vitest
      const promise = loadNuxt({ cwd: nuxt.options.rootDir }).then(nuxt => nuxt.runWithContext(
        () => startVitest('test', [], { ...watchMode
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
          : { watch: false }, root: nuxt.options.rootDir })))
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
