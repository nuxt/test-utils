import { expect, it } from 'vitest'
import { mockNuxtImport } from 'vitest-environment-nuxt/utils'

mockNuxtImport('useHead', () => {
  return () => true
})

it('should mock core nuxt composables', () => {
  expect(useHead({})).toMatchInlineSnapshot('true')
})
