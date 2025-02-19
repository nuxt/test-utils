import { expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useHead', () => {
  return () => true
})

it('should mock core nuxt composables', () => {
  expect(useHead({})).toMatchInlineSnapshot('true')
})
