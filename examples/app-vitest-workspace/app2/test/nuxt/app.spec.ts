import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('useAppConfig', () => {
    expect(
      Object.keys(useAppConfig()).toSorted(),
    ).toEqual(['nuxt', 'ui', 'icon'].toSorted())
  })

  it('useRuntimeConfig', () => {
    expect(useRuntimeConfig().icon).toBeDefined()
  })
})
