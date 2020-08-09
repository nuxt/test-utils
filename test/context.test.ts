import { createContext, getContext, NuxtTestContext } from '../src'

describe('context', () => {
  test('should be error if no context available', () => {
    expect(() => getContext()).toThrowError('No context is available. (Forgot calling setup or createContext?)')
  })

  test('default values from context', () => {
    const ctx: NuxtTestContext = createContext({ testDir: 'foo' })
    expect(ctx).toMatchSnapshot()
  })
})
