// @vitest-environment-options { "domEnvironment": "jsdom" }

import { expect, it } from 'vitest'

it('can override domEnvironment via @vitest-environment-options', () => {
  expect(navigator.userAgent).toContain('jsdom')
})

it('can access url from default options', () => {
  expect(location.origin).toBe('http://localhost:3000')
})

it('can access runtimeConfig from resolved options', () => {
  expect(useRuntimeConfig().public).toMatchObject({
    hello: 'world',
  })
})
