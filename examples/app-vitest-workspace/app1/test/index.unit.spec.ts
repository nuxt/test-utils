import { describe, expect, it } from 'vitest'

describe('unit test', () => {
  it('window is undefined', () => {
    expect(typeof window).toBe('undefined')
  })

  it('__NUXT_VITEST_RESOLVED__ is undefined', () => {
    // @ts-expect-error injected global, not typed
    expect(typeof __NUXT_VITEST_RESOLVED__).toBe('undefined')
  })
})
