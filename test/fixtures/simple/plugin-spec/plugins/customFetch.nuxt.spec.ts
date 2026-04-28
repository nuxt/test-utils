import { it, expect } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useHead', () => {
  return () => 'mocked-head'
})

it('plugin spec runs under nuxt env', () => {
  expect(globalThis.window).toBeDefined()
  expect(globalThis.window).toHaveProperty('__NUXT_VITEST_ENVIRONMENT__', true)
})

it('mockNuxtImport works inside plugins/ directory', () => {
  expect(useHead({})).toBe('mocked-head')
})
