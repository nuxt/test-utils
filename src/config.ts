import type { Nuxt, NuxtConfig, ViteConfig } from '@nuxt/schema'
import type { InlineConfig as VitestConfig } from 'vitest'
import { defineConfig } from 'vite'
import type { InlineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import viteJsxPlugin from '@vitejs/plugin-vue-jsx'
import { defu } from 'defu'

interface GetVitestConfigOptions {
  nuxt: Nuxt
  viteConfig: InlineConfig
}

// https://github.com/nuxt/framework/issues/6496
async function startNuxtAndGetViteConfig(
  rootDir = process.cwd(),
  overrides?: Partial<NuxtConfig>
) {
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')
  const nuxt = await loadNuxt({
    cwd: rootDir,
    dev: false,
    overrides: defu(
      {
        ssr: false,
        test: true,
        modules: ['@nuxt/test-utils/module'],
      },
      overrides
    ),
  })

  if (
    !nuxt.options._installedModules.find(i => i?.meta?.name === '@nuxt/test-utils')
  ) {
    throw new Error(
      'Failed to load nuxt-vitest module. You may need to add it to your nuxt.config.'
    )
  }

  const promise = new Promise<GetVitestConfigOptions>((resolve, reject) => {
    nuxt.hook('vite:extendConfig', (viteConfig, { isClient }) => {
      if (isClient) {
        resolve({ nuxt, viteConfig })
        throw new Error('_stop_')
      }
    })
    buildNuxt(nuxt).catch(err => {
      if (!err.toString().includes('_stop_')) {
        reject(err)
      }
    })
  }).finally(() => nuxt.close())

  return promise
}

const vuePlugins = {
  'vite:vue': [vuePlugin, 'vue'],
  'vite:vue-jsx': [viteJsxPlugin, 'vueJsx'],
} as const

export async function getVitestConfigFromNuxt(
  options?: GetVitestConfigOptions,
  overrides?: NuxtConfig
): Promise<InlineConfig & { test: VitestConfig }> {
  const { rootDir = process.cwd(), ..._overrides } = overrides || {}
  if (!options) options = await startNuxtAndGetViteConfig(rootDir, {
    test: true,
    ..._overrides
  })
  options.viteConfig.plugins = options.viteConfig.plugins || []
  options.viteConfig.plugins = options.viteConfig.plugins.filter(
    p => (p as any)?.name !== 'nuxt:import-protection'
  )

  for (const name in vuePlugins) {
    if (!options.viteConfig.plugins?.some(p => (p as any)?.name === name)) {
      const [plugin, key] = vuePlugins[name as keyof typeof vuePlugins]
      options.viteConfig.plugins.unshift(
        // @ts-expect-error mismatching component options
        plugin((options.viteConfig as ViteConfig)[key])
      )
    }
  }

  const resolvedConfig = defu(
    // overrides
    {
      define: {
        ['process.env.NODE_ENV']: 'process.env.NODE_ENV',
      },
      test: {
        dir: process.cwd(),
        environmentOptions: {
          nuxtRuntimeConfig: options.nuxt.options.runtimeConfig,
          nuxtRouteRules: defu(
            {},
            options.nuxt.options.routeRules,
            options.nuxt.options.nitro?.routeRules
          ),
        },
        environmentMatchGlobs: [
          ['**/*.nuxt.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'nuxt'],
          ['{test,tests}/nuxt/**.*', 'nuxt'],
        ],
        deps: {
          inline: [
            // vite-node defaults
            /\/node_modules\/(.*\/)?(nuxt|nuxt3)\//,
            /^#/,
            // additional deps
            '@nuxt/test-utils',
            'vitest-environment-nuxt',
            ...(options.nuxt.options.build.transpile.filter(
              r => typeof r === 'string' || r instanceof RegExp
            ) as Array<string | RegExp>),
          ],
        },
      } satisfies VitestConfig
    },
    {
      server: { middlewareMode: false },
      plugins: [
        {
          name: 'disable-auto-execute',
          enforce: 'pre',
          transform(code, id) {
            if (id.match(/nuxt3?\/.*\/entry\./)) {
              return code.replace(
                /(?<!vueAppPromise = )entry\(\)\.catch/,
                'Promise.resolve().catch'
              )
            }
          },
        },
      ],
    } satisfies InlineConfig,
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
          }
        }
      } satisfies VitestConfig
    }
  ) as InlineConfig & { test: VitestConfig }

  delete resolvedConfig.define!['process.browser']

  return resolvedConfig
}

export function defineVitestConfig(config: InlineConfig & { test?: VitestConfig } = {}) {
  // @ts-expect-error TODO: investigate type mismatch
  return defineConfig(async () => {
    // When Nuxt module calls `startVitest`, we don't need to call `getVitestConfigFromNuxt` again
    if (process.env.__NUXT_VITEST_RESOLVED__) return config

    const overrides = config.test?.environmentOptions?.nuxt?.overrides || {}
    overrides.rootDir = config.test?.environmentOptions?.nuxt?.rootDir

    return defu(
      config,
      await getVitestConfigFromNuxt(undefined, overrides),
    )
  })
}

declare module 'vitest' {
  interface EnvironmentOptions {
    nuxt?: {
      rootDir?: string
      /**
       * The starting URL for your Nuxt window environment
       * @default {http://localhost:3000}
       */
      url?: string
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
  }
}
