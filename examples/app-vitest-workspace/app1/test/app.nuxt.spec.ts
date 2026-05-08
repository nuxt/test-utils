import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('useAppConfig', () => {
    expect(Object.keys(useAppConfig())).toEqual(['nuxt'])
  })

  it('__NUXT_VITEST_RESOLVED__ is true', () => {
    // @ts-expect-error injected global, not typed
    expect(__NUXT_VITEST_RESOLVED__).toBe(true)
  })
})
