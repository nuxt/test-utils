import { describe, expect, it } from 'vitest'

describe('my test', () => {
  it('works', () => {
    expect(Object.keys(useAppConfig())).toMatchInlineSnapshot(`
      [
        "nuxt",
      ]
    `)
  })

  it('should config environment options', async () => {
    expect(Reflect.get(window, '__NUXT_VITEST_ENVIRONMENT_OPTIONS__')).toMatchObject({
      url: 'http://localhost:3000',
      startOn: 'setupFile',
      domEnvironment: 'jsdom',
    })
    expect(location.origin).toBe('http://localhost:3000')
  })
})
