import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('useAppConfig', () => {
    expect(Object.keys(useAppConfig())).toEqual(['nuxt'])
  })
})
