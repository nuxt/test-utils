import { beforeAll, vi } from 'vitest'
import { setupNuxt } from './shared/nuxt.ts'

if (
  typeof window !== 'undefined'
  // @ts-expect-error undefined property
  && window.__NUXT_VITEST_ENVIRONMENT__
) {
  vi.resetModules()
  beforeAll(async () => {
    await setupNuxt()
  })
}

export {}
