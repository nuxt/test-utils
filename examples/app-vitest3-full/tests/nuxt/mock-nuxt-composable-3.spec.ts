import { expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useAutoImportedTarget', () => {
  return () => 'mocked'
})

mockNuxtImport('useDefaultExport', () => {
  return () => 'mocked'
})

it('should mock composables from project', () => {
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"mocked"')
})

it('should mock composables from project even if it uses `export default`', () => {
  expect(useDefaultExport()).toMatchInlineSnapshot('"mocked"')
})
