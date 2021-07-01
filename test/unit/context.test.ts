import { createContext, getContext } from '../../src'

describe('context', () => {
  test('should be error if no context available', () => {
    expect(() => getContext()).toThrowError('No context is available. (Forgot calling setup or createContext?)')
  })

  test('default values from context', () => {
    const ctx = createContext()
    expect(ctx).toMatchSnapshot()
  })
})
