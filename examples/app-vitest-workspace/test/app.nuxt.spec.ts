import { describe, expect, it } from 'vitest'

describe('my test', () => {
  it('works', () => {
    expect(Object.keys(useAppConfig())).toMatchInlineSnapshot(`
      [
        "nuxt",
      ]
    `)
  })
})
