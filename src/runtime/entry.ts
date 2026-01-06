import { beforeAll } from 'vitest'
import { setupNuxt } from './shared/nuxt'

if (
  typeof window !== 'undefined'
  // @ts-expect-error undefined property
  && window.__NUXT_VITEST_ENVIRONMENT__
) {
  beforeAll(async () => {
    await setupNuxt()
  })
}

export {}
