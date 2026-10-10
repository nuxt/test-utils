import { beforeAll, vi } from 'vitest'
import { tryUseNuxtApp } from '#imports'
import { setupNuxt } from './shared/nuxt.ts'
import type { NuxtWindow } from '../vitest-environment.ts'

if (typeof window !== 'undefined') {
  const win = window as unknown as NuxtWindow

  if (
    win.__NUXT_VITEST_ENVIRONMENT__
    && !win.__NUXT_VITEST_ENVIRONMENT_BROWSER_ENTRY__
  ) {
    if (!tryUseNuxtApp()) {
      vi.resetModules()
    }

    beforeAll(async () => {
      win.__NUXT_VITEST_ENVIRONMENT_PROMISE__ ??= setupNuxt().catch((err) => {
        tryUseNuxtApp()?.vueApp?.unmount()
        delete win.__NUXT_VITEST_ENVIRONMENT_PROMISE__
        throw err
      })

      await win.__NUXT_VITEST_ENVIRONMENT_PROMISE__
    })
  }
}

export {}
