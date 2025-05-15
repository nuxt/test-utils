// @ts-expect-error virtual file
import environmentOptions from 'nuxt-vitest-environment-options'

import type { NuxtWindow } from '../vitest-environment'
import { setupNuxt } from './shared/nuxt'
import { setupWindow } from './shared/environment'

const el = document.querySelector(environmentOptions.nuxt.rootId || 'nuxt-test')
if (!el) {
  await setupWindow(window as unknown as NuxtWindow, environmentOptions)
  await setupNuxt()
}
