import { describe, expect, it } from 'vitest'

describe('test overrides', () => {
  it('should override dev environment', async () => {
    const isDev = import.meta.dev
    expect(isDev).toBe(true)
  })
})
