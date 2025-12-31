import { createResolver, defineNuxtModule, logger, resolvePath, useNuxt } from '@nuxt/kit'
import type { TestUserConfig as VitestConfig } from 'vitest/config'
import { join, relative } from 'pathe'
import { isCI } from 'std-env'

import { setupImportMocking } from './module/mock'
import { NuxtRootStubPlugin } from './module/plugins/entry'
import { loadKit } from './utils'
import { setupDevTools } from './devtools'
import { vitestWrapper } from './vitest-wrapper/host'

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

    const isDevToolsEnabled = typeof nuxt.options.devtools === 'boolean'
      ? nuxt.options.devtools
      : nuxt.options.devtools.enabled

    if (isDevToolsEnabled) {
      await setupDevTools(vitestWrapper, nuxt)
    }

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
