import { it, describe, expect, beforeEach } from 'vitest'

describe('global middleware', () => {
  beforeEach(() => {
    useGlobalCounter().count.value = 0
  })

  it('increment count by global middleware', async () => {
    await navigateTo({ path: '/', force: true })
    expect(useGlobalCounter().count.value).toBe(1)
  })
})
