import { createContext, getContext, setContext, NuxtTestContext } from '../src'

describe('context', () => {
  beforeEach(() => {
    setContext(null)
  })

  test('should be error if no context available', () => {
    expect(() => getContext()).toThrowError('No context is available. (Forgot calling setup or createContext?)')
  })

  test('default values from context', () => {
    const ctx: NuxtTestContext = createContext({})

    expect(ctx).toStrictEqual({
      __dirname: ctx.__dirname,
      configFile: 'nuxt.config.js',
      browserString: 'puppeteer',
      buildTimeout: 60000,
      server: undefined,
      build: undefined,
      config: {}
    })
  })
})
