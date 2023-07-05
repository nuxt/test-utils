import type { Nuxt, NuxtConfig, ViteConfig } from '@nuxt/schema'
import type { InlineConfig as VitestConfig } from 'vitest'
import { InlineConfig, mergeConfig, defineConfig } from 'vite'
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
        modules: ['nuxt-vitest']
      },
      overrides
    ),
  })

  if (
    !nuxt.options._installedModules.find(i => i?.meta?.name === 'nuxt-vitest')
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
  if (!options) options = await startNuxtAndGetViteConfig(rootDir, _overrides)
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

  return {
    ...options.viteConfig,
    define: {
      ...options.viteConfig.define,
      ['process.env.NODE_ENV']: 'process.env.NODE_ENV'
    },
    server: {
      ...options.viteConfig.server,
      middlewareMode: false,
    },
    plugins: [
      ...options.viteConfig.plugins,
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
    test: {
      ...options.viteConfig.test,
      dir: process.cwd(),
      environmentOptions: {
        ...options.viteConfig.test?.environmentOptions,
        nuxt: {
          rootId: options.nuxt.options.app.rootId,
          ...options.viteConfig.test?.environmentOptions?.nuxt,
        },
        nuxtRuntimeConfig: options.nuxt.options.runtimeConfig,
      },
      environmentMatchGlobs: [
        ['**/*.nuxt.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'nuxt'],
        ['{test,tests}/nuxt/**.*', 'nuxt'],
        ...(options.viteConfig.test?.environmentMatchGlobs || []),
      ],
      deps: {
        ...options.viteConfig.test?.deps,
        inline:
          options.viteConfig.test?.deps?.inline === true
            ? true
            : [
                // vite-node defaults
                /\/node_modules\/(.*\/)?(nuxt|nuxt3)\//,
                /^#/,
                'vite',
                // additional deps
                'vue',
                'vitest-environment-nuxt',
                ...(options.nuxt.options.build.transpile.filter(
                  r => typeof r === 'string' || r instanceof RegExp
                ) as Array<string | RegExp>),
                ...(options.viteConfig.test?.deps?.inline || []),
              ],
      },
    },
  }
}

export function defineVitestConfig(config: InlineConfig = {}) {
  return defineConfig(async () => {
    // When Nuxt module calls `startVitest`, we don't need to call `getVitestConfigFromNuxt` again
    if (process.env.__NUXT_VITEST_RESOLVED__) return config

    const overrides = config.test?.environmentOptions?.nuxt?.overrides || {}
    overrides.rootDir = config.test?.environmentOptions?.nuxt?.rootDir

    return mergeConfig(
      await getVitestConfigFromNuxt(undefined, overrides),
      config
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
       * 
       * @default {happy-dom}
       */
      domEnvironment?: 'happy-dom' | 'jsdom'
    }
  }
}
