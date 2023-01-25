import type { Nuxt } from '@nuxt/schema'
import type { InlineConfig as VitestConfig } from 'vitest'
import { InlineConfig, mergeConfig, defineConfig } from 'vite'

interface GetVitestConfigOptions {
  nuxt: Nuxt
  viteConfig: InlineConfig
}

// https://github.com/nuxt/framework/issues/6496
async function startNuxtAndGetViteConfig(rootDir = process.cwd()) {
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')
  const nuxt = await loadNuxt({
    cwd: rootDir,
    dev: false,
    overrides: {
      ssr: false,
      app: {
        rootId: 'nuxt-test',
      },
    },
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

export async function getVitestConfigFromNuxt(
  options?: GetVitestConfigOptions
): Promise<InlineConfig & { test: VitestConfig }> {
  if (!options) options = await startNuxtAndGetViteConfig()

  return {
    ...options.viteConfig,
    server: {
      ...options.viteConfig.server,
      middlewareMode: false,
    },
    test: {
      ...options.viteConfig.test,
      dir: options.nuxt.options.rootDir,
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
                /\/(nuxt|nuxt3)\//,
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
    return mergeConfig(await getVitestConfigFromNuxt(), config)
  })
}
