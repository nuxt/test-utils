// @vitest-environment-options { "startOn": "beforeAll", "url": "http://localhost:4000", "domEnvironment": "happy-dom" }
import { describe, expect, it } from 'vitest'

describe('inline environment-options', () => {
  it('should applied @vitest-environment-options', async () => {
    expect(Reflect.get(window, '__NUXT_VITEST_ENVIRONMENT_OPTIONS__')).toMatchObject({
      url: 'http://localhost:4000',
      startOn: 'beforeAll',
      domEnvironment: 'happy-dom',
    })
    expect(location.origin).toBe('http://localhost:4000')
  })
})
