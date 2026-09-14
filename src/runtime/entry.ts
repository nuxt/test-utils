import { beforeAll, vi } from 'vitest'
import { setupNuxt } from './shared/nuxt.ts'
// @ts-expect-error virtual file
import environmentOptions from 'nuxt-vitest-environment-options'
import type { NuxtWindow } from '../vitest-environment.ts'
import type { NuxtEnvironmentResolvedOptions } from '../config.ts'

if (
  typeof window !== 'undefined'
  // @ts-expect-error undefined property
  && window.__NUXT_VITEST_ENVIRONMENT__
) {
  vi.resetModules()
  beforeAll(async () => {
    await setup()
  })
}

async function setup() {
  const win = window as unknown as NuxtWindow
  const options: NuxtEnvironmentResolvedOptions = environmentOptions

  if (options.nuxt.setupScope === 'worker') {
    win.__NUXT_VITEST_NUXT_SETUP_PROMISE__ ??= setupNuxt().catch((err) => {
      delete win.__NUXT_VITEST_NUXT_SETUP_PROMISE__
      throw err
    })
    return win.__NUXT_VITEST_NUXT_SETUP_PROMISE__
  }

  return setupNuxt()
}

export {}
