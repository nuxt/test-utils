import { expect, it } from 'vitest'

it('should return the runtimeConfig from nuxt.config', () => {
  const config = useRuntimeConfig()
  expect(config).toBeTypeOf('object')
  expect(config?.public).toEqual({
    hello: 'world',
    testValue: 123,
  })
})
