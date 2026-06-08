// @vitest-environment-options { "url": "http://localhost:8000" }

import { expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

registerEndpoint('/api/vitest-environment-options/1', () => 'ok1')
registerEndpoint('http://localhost:8000/api/vitest-environment-options/2', () => 'ok2')

it('can override url via @vitest-environment-options', () => {
  expect(location.origin).toBe('http://localhost:8000')
})

it('can access runtimeConfig from resolved options', () => {
  expect(useRuntimeConfig().public).toMatchObject({
    hello: 'world',
  })
})

it('can access domEnvironment from resolved options', () => {
  if (process.env.VITEST_DOM_ENV === 'jsdom') {
    expect(navigator.userAgent).toContain('jsdom')
  }
  else {
    expect(navigator.userAgent).not.toContain('jsdom')
  }
})

it('can mock api endpoints with registerEndpoint', async () => {
  expect(await $fetch<string>('/api/vitest-environment-options/1')).toBe('ok1')
  expect(await $fetch<string>('http://localhost:8000/api/vitest-environment-options/2')).toBe('ok2')

  expect(await fetch('/api/vitest-environment-options/1').then(r => r.text())).toBe('ok1')
  expect(await fetch('http://localhost:8000/api/vitest-environment-options/2').then(r => r.text())).toBe('ok2')
  expect(await fetch(new URL('/api/vitest-environment-options/2', location.origin)).then(r => r.text())).toBe('ok2')
})
