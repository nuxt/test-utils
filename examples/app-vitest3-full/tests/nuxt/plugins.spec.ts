import { describe, expect, it } from 'vitest'

describe('plugins', () => {
  it('can access injections', () => {
    const app = useNuxtApp()
    expect(app.$auth.didInject).toMatchInlineSnapshot('true')
    expect(app.$router).toBeDefined()
  })
})
