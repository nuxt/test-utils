import { beforeAll, vi } from 'vitest'
import { setupNuxt } from './shared/nuxt'
import type { NuxtWindow } from '../vitest-environment'

if (
  typeof window !== 'undefined'
  // @ts-expect-error undefined property
  && window.__NUXT_VITEST_ENVIRONMENT__
) {
  const options = (window as unknown as NuxtWindow).__NUXT_VITEST_ENVIRONMENT_OPTIONS__ ?? {}
  if (options.startOn === 'beforeAll') {
    beforeAll(async () => {
      await setupNuxt()
    })
  }
  else {
    await setupNuxt()
    vi.resetModules()
  }
}

export {}
