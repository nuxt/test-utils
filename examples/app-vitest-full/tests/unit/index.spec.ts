import { expect, it } from 'vitest'

it('unit test', () => {
  expect(typeof window).toBe('undefined')
})

it('hello nuxt', () => {
  expect(useRuntimeConfig().public.hello).toBe('nuxt')
})
