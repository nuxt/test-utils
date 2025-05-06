import process from 'node:process'
import type { Nuxt, NuxtConfig } from '@nuxt/schema'
import type { UserWorkspaceConfig, InlineConfig as VitestConfig } from 'vitest/node'
import { defineConfig } from 'vitest/config'
import type { TestProjectInlineConfiguration } from 'vitest/config'
import { setupDotenv } from 'c12'
import type { DotenvOptions } from 'c12'
import type { UserConfig as ViteUserConfig } from 'vite'
import type { DateString } from 'compatx'
import { defu } from 'defu'
import { loadNuxt, buildNuxt, createResolver, findPath } from '@nuxt/kit'

import { applyEnv } from './utils'

interface GetVitestConfigOptions {
  nuxt: Nuxt
  viteConfig: ViteUserConfig
}

interface LoadNuxtOptions {
  dotenv?: Partial<DotenvOptions>
  overrides?: Partial<NuxtConfig>
}

// https://github.com/nuxt/framework/issues/6496
async function startNuxtAndGetViteConfig(rootDir = process.cwd(), options: LoadNuxtOptions = {}) {
  const nuxt = await loadNuxt({
    cwd: rootDir,
    dev: false,
    dotenv: defu(options.dotenv, {
      cwd: rootDir,
      fileName: '.env.test',
    }),
    defaults: {
      // suppress compatibility date warning for runtime environment tests
      compatibilityDate: '2024-04-03' as DateString,
    },
    overrides: defu(
      {
        appId: 'nuxt-app',
        buildId: 'test',
        ssr: false,
        test: true,
        modules: ['@nuxt/test-utils/module'],
      },
      options.overrides,
    ),
  })

  if (
    !nuxt.options._installedModules.find(i => i?.meta?.name === '@nuxt/test-utils')
  ) {
    throw new Error(
      'Failed to load `@nuxt/test-utils/module`. You may need to add it to your nuxt.config.',
    )
  }

  const promise = new Promise<GetVitestConfigOptions>((resolve, reject) => {
    nuxt.hook('vite:configResolved', (viteConfig, { isClient }) => {
      if (isClient) {
        resolve({ nuxt, viteConfig })
        throw new Error('_stop_')
      }
    })
    buildNuxt(nuxt).catch((err) => {
      if (!err.toString().includes('_stop_')) {
        reject(err)
      }
    })
  }).finally(() => nuxt.close())

  return promise
}

const excludedPlugins = [
  'nuxt:import-protection',
  'nuxt:import-conditions',
  'vite-plugin-checker',
]

export async function getVitestConfigFromNuxt(
  options?: GetVitestConfigOptions,
  loadNuxtOptions: LoadNuxtOptions = {},
): Promise<ViteUserConfig & { test: VitestConfig }> {
  const { rootDir = process.cwd(), ..._overrides } = loadNuxtOptions.overrides || {}

  if (!options) {
    options = await startNuxtAndGetViteConfig(rootDir, {
      dotenv: loadNuxtOptions.dotenv,
      overrides: {
        test: true,
        ..._overrides,
      },
    })
  }

  options.viteConfig.plugins = (options.viteConfig.plugins || []).filter(p => !p || !('name' in p) || !excludedPlugins.includes(p.name))

  const resolvedConfig = defu(
    // overrides
    {
      define: {
        'process.env.NODE_ENV': '"test"',
      },
      test: {
        dir: process.cwd(),
        environmentOptions: {
          nuxtRuntimeConfig: applyEnv(structuredClone(options.nuxt.options.runtimeConfig), {
            prefix: 'NUXT_',
            env: await setupDotenv(defu(loadNuxtOptions.dotenv, {
              cwd: rootDir,
              fileName: '.env.test',
            })),
          }),
          nuxtRouteRules: defu(
            {},
            options.nuxt.options.routeRules,
            options.nuxt.options.nitro?.routeRules,
          ),
        },
        server: {
          deps: {
            inline: [
              // vite-node defaults
              /\/node_modules\/(.*\/)?(nuxt|nuxt3|nuxt-nightly)\//,
              /^#/,
              // additional deps
              '@nuxt/test-utils',
              '@nuxt/test-utils-nightly',
              '@nuxt/test-utils-edge',
              'vitest-environment-nuxt',
              ...(options.nuxt.options.build.transpile.filter(
                r => typeof r === 'string' || r instanceof RegExp,
              ) as Array<string | RegExp>),
            ],
          },
        },
        deps: {
          optimizer: {
            web: {
              enabled: false,
            },
          },
        },
      } satisfies VitestConfig,
    },
    {
      server: { middlewareMode: false },
      plugins: [
        {
          // TODO: prefix with 'nuxt:test-utils:' in next major version
          name: 'disable-auto-execute',
          enforce: 'pre',
          transform(code, id) {
            if (id.match(/nuxt(3|-nightly)?\/.*\/entry\./)) {
              return code.replace(
                /(?<!vueAppPromise = )entry\(\)/,
                'Promise.resolve()',
              )
            }
          },
        },
        {
          name: 'nuxt:test-utils:browser-conditions',
          enforce: 'pre',
          config() {
            return {
              resolve: {
                conditions: ['web', 'import', 'module', 'default'],
              },
            }
          },
        },
      ],
    } satisfies ViteUserConfig,
    // resolved vite config
    options.viteConfig,
    // (overrideable) defaults
    {
      test: {
        environmentOptions: {
          nuxt: {
            rootId: options.nuxt.options.app.rootId || undefined,
            mock: {
              intersectionObserver: true,
              indexedDb: false,
            },
          },
        },
      } satisfies VitestConfig,
    },
  ) as ViteUserConfig & { test: VitestConfig }

  // TODO: fix this by separating nuxt/node vitest configs
  // typescript currently checks this to determine if it can access the filesystem: https://github.com/microsoft/TypeScript/blob/d4fbc9b57d9aa7d02faac9b1e9bb7b37c687f6e9/src/compiler/core.ts#L2738-L2749
  delete resolvedConfig.define!['process.browser']

  // Remove built-in Nuxt logger: https://github.com/vitest-dev/vitest/issues/5211
  delete resolvedConfig.customLogger

  if (!Array.isArray(resolvedConfig.test.setupFiles)) {
    resolvedConfig.test.setupFiles = [resolvedConfig.test.setupFiles].filter(Boolean) as string[]
  }

  const resolver = createResolver(import.meta.url)
  const entryPath = resolver.resolve('./runtime/entry')
  resolvedConfig.test.setupFiles.unshift(await findPath(entryPath) ?? entryPath)

  return resolvedConfig
}

export async function defineVitestProject(config: TestProjectInlineConfiguration) {
  // When Nuxt module calls `startVitest`, we don't need to call `getVitestConfigFromNuxt` again
  if (process.env.__NUXT_VITEST_RESOLVED__) return config

  const resolvedConfig = await resolveConfig(config)

  resolvedConfig.test.environment = 'nuxt'

  return resolvedConfig
}

export function defineVitestConfig(config: ViteUserConfig & { test?: VitestConfig } = {}) {
  return defineConfig(async () => {
    // When Nuxt module calls `startVitest`, we don't need to call `getVitestConfigFromNuxt` again
    if (process.env.__NUXT_VITEST_RESOLVED__) return config

    const resolvedConfig = await resolveConfig(config)

    if (resolvedConfig.test.browser?.enabled) {
      return resolvedConfig
    }

    if ('workspace' in resolvedConfig.test) {
      throw new Error(
        'The `workspace` option is not supported with `defineVitestConfig`. Instead, use `defineVitestProject` to define each workspace project that uses the Nuxt environment.',
      )
    }

    const defaultEnvironment = resolvedConfig.test.environment || 'node'
    if (defaultEnvironment !== 'nuxt') {
      resolvedConfig.test.workspace = []
      resolvedConfig.test.workspace.push({
        extends: true,
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: [
            '**/*.nuxt.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            '{test,tests}/nuxt/**.*',
          ],
        },
      })
    }

    return resolvedConfig
  })
}

async function resolveConfig<T extends ViteUserConfig & { test?: VitestConfig } | UserWorkspaceConfig>(config: T) {
  const overrides = config.test?.environmentOptions?.nuxt?.overrides || {}
  overrides.rootDir = config.test?.environmentOptions?.nuxt?.rootDir

  if (config.test?.setupFiles && !Array.isArray(config.test.setupFiles)) {
    config.test.setupFiles = [config.test.setupFiles].filter(Boolean) as string[]
  }

  return defu(
    config satisfies T,
    await getVitestConfigFromNuxt(undefined, {
      dotenv: config.test?.environmentOptions?.nuxt?.dotenv,
      overrides: structuredClone(overrides),
    }) satisfies ViteUserConfig & { test: NonNullable<T['test']> },
  ) as T & { test: NonNullable<T['test']> }
}

interface NuxtEnvironmentOptions {
  rootDir?: string
  /**
   * The starting URL for your Nuxt window environment
   * @default {http://localhost:3000}
   */
  url?: string
  /**
   * You can define how environment options are read when loading the Nuxt configuration.
   */
  dotenv?: Partial<DotenvOptions>
  /**
   * Configuration that will override the values in your `nuxt.config` file.
   */
  overrides?: NuxtConfig
  /**
   * The id of the root div to which the app should be mounted. You should also set `app.rootId` to the same value.
   * @default {nuxt-test}
   */
  rootId?: string
  /**
   * The name of the DOM environment to use.
   *
   * It also needs to be installed as a dev dependency in your project.
   * @default {happy-dom}
   */
  domEnvironment?: 'happy-dom' | 'jsdom'

  mock?: {
    intersectionObserver?: boolean
    indexedDb?: boolean
  }
}

declare module 'vitest/node' {
  interface EnvironmentOptions {
    nuxt?: NuxtEnvironmentOptions
  }
}

declare module 'vitest' {
  // @ts-expect-error Duplicate augmentation for backwards-compatibility
  interface EnvironmentOptions {
    nuxt?: NuxtEnvironmentOptions
  }
}
