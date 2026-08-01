import { createResolver, defineNuxtModule, logger, resolvePath, useNuxt } from '@nuxt/kit'
import { onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { TestUserConfig as VitestConfig } from 'vitest/config'
import { join, relative } from 'pathe'
import { isCI } from 'std-env'

import { setupImportMocking } from './module/mock.ts'
import { NuxtRootStubPlugin } from './module/plugins/entry.ts'
import { runInstallWizard } from './module/install-wizard.ts'
import { loadKit } from './utils.ts'
import { setupDevTools } from './devtools.ts'
import { vitestWrapper } from './vitest-wrapper/host.ts'

import pkg from '../package.json' with { type: 'json' }

export interface NuxtVitestOptions {
  startOnBoot?: boolean
  logToConsole?: boolean
  vitestConfig?: VitestConfig
}

export default defineNuxtModule<NuxtVitestOptions>({
  meta: {
    name: '@nuxt/test-utils',
    configKey: 'testUtils',
    version: pkg.version,
  },
  defaults: {
    startOnBoot: false,
    logToConsole: false,
  },
  async onInstall(nuxt) {
    await runInstallWizard(nuxt)
  },
  async setup(options, nuxt) {
    if (nuxt.options.test || nuxt.options.dev) {
      await setupImportMocking(nuxt)
    }

    // inline runtime config the way dev builds do
    if (nuxt.options.test && !nuxt.options.dev) {
      nuxt.hook('app:templates', (app) => {
        const template = app.templates.find(t => t.filename === 'paths.mjs')
        if (!template?.getContents) {
          return
        }
        const original = template.getContents
        const inlineAppConfig = JSON.stringify(nuxt.options.app)
        template.getContents = async (data) => {
          const contents = await original(data)
          return contents
            .replace(/^import \{ useRuntimeConfig \} from ['"]nitropack\/runtime['"]\n?/m, '')
            .replace(/const getAppConfig = \(\) => useRuntimeConfig\(\)\.app/, () => `const getAppConfig = () => (${inlineAppConfig})`)
        }
      })
    }

    const { addVitePlugin } = await loadKit(nuxt.options.rootDir)

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
      // TODO: drop once Nuxt enables this by default for source-pointing exports.
      // `@nuxt/test-utils` exports resolve to `.ts` source at dev time, so consumer
      // typechecks need this flag to follow them.
      for (const tsConfig of [ctx.tsConfig, ctx.nodeTsConfig, ctx.sharedTsConfig]) {
        if (!tsConfig) continue
        tsConfig.compilerOptions ||= {}
        tsConfig.compilerOptions.allowImportingTsExtensions = true
      }
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

    const vitestWrapper = createVitestWrapper(options, nuxt)

    onDevToolsInitialized(async () => {
      await setupDevTools(vitestWrapper, nuxt)
    }, nuxt)

    if (options.startOnBoot) {
      vitestWrapper.start()
    }
  },
})

function createVitestWrapper(options: NuxtVitestOptions, nuxt = useNuxt()) {
  const watchMode = !isCI

  const wrapper = vitestWrapper({
    cwd: nuxt.options.rootDir,
    apiPorts: [15555],
    logToConsole: options.logToConsole ?? false,
    watchMode,
  })

  wrapper.ons({
    started({ uiUrl }) {
      if (watchMode) {
        logger.info(`Vitest UI starting on ${uiUrl}`)
      }
    },
    exited({ exitCode }) {
      if (watchMode) {
        logger.info(`Vitest exited with code ${exitCode}`)
      }
      else {
        nuxt.close().finally(() => process.exit(exitCode))
      }
    },
  })

  nuxt.hooks.addHooks({
    close: () => wrapper.stop(),
    restart: () => wrapper.stop(),
  })

  return wrapper
}
