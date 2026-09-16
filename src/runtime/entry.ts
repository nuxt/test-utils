import { beforeAll, vi } from 'vitest'
import { setupNuxt } from './shared/nuxt.ts'
import type { NuxtWindow } from '../vitest-environment.ts'

if (
  typeof window !== 'undefined'
  // @ts-expect-error undefined property
  && window.__NUXT_VITEST_ENVIRONMENT__
) {
  vi.resetModules()
  beforeAll(async () => {
    const win = window as unknown as NuxtWindow

    win.__NUXT_VITEST_NUXT_SETUP_PROMISE__ ??= setupNuxt().catch((err) => {
      delete win.__NUXT_VITEST_NUXT_SETUP_PROMISE__
      throw err
    })

    return win.__NUXT_VITEST_NUXT_SETUP_PROMISE__
  })
}

export {}
