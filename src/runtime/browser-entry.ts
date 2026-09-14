// @ts-expect-error virtual file
import environmentOptions from 'nuxt-vitest-environment-options'
import type { NuxtWindow } from '../vitest-environment.ts'
import type { NuxtEnvironmentResolvedOptions } from '../config.ts'
import { setupNuxt } from './shared/nuxt.ts'
import { setupWindow } from './shared/environment.ts'

async function setup() {
  const win = window as unknown as NuxtWindow
  const options: NuxtEnvironmentResolvedOptions = environmentOptions

  const setupNuxtApp = async () => {
    await setupWindow(win, options)
    await setupNuxt()
  }

  if (options.nuxt.setupScope === 'worker') {
    win.__NUXT_VITEST_NUXT_SETUP_PROMISE__ ??= setupNuxtApp().catch((err) => {
      delete win.__NUXT_VITEST_NUXT_SETUP_PROMISE__
      throw err
    })
    return win.__NUXT_VITEST_NUXT_SETUP_PROMISE__
  }

  return setupNuxtApp()
}

await setup()
