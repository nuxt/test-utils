import { describe, expect, it } from 'vitest'

describe('my test', () => {
  // ... test with Nuxt environment!
  it('works', () => {
    expect(Object.keys(useAppConfig())).toMatchInlineSnapshot(`
      [
        "nuxt",
      ]
    `)
  })
})
