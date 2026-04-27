import { describe, expect, it } from 'vitest'

describe('plugins', () => {
  it('colorMode', () => {
    expect(useNuxtApp().$colorMode).toBeDefined()
  })
})
