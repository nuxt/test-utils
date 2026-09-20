// @ts-expect-error virtual file
import environmentOptions from 'nuxt-vitest-environment-options'
import { tryUseNuxtApp } from '#imports'
import type { NuxtWindow } from '../vitest-environment.ts'
import { setupNuxt } from './shared/nuxt.ts'
import { setupWindow } from './shared/environment.ts'

const win = window as unknown as NuxtWindow

win.__NUXT_VITEST_ENVIRONMENT_BROWSER_ENTRY__ = true

if (!win.__NUXT_VITEST_ENVIRONMENT__) {
  await setupWindow(win, environmentOptions)
}

win.__NUXT_VITEST_ENVIRONMENT_PROMISE__ ??= setupNuxt().catch((err) => {
  tryUseNuxtApp()?.vueApp?.unmount()
  delete win.__NUXT_VITEST_ENVIRONMENT_PROMISE__
  throw err
})

await win.__NUXT_VITEST_ENVIRONMENT_PROMISE__
