// @ts-expect-error virtual file
import environmentOptions from 'nuxt-vitest-environment-options'

import type { NuxtWindow } from '../vitest-environment.ts'
import { setupNuxt } from './shared/nuxt.ts'
import { setupWindow } from './shared/environment.ts'

await setupWindow(window as unknown as NuxtWindow, environmentOptions)
await setupNuxt()
