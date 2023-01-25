import { expect, it } from 'vitest'
import { mockNuxtImport } from 'vitest-environment-nuxt/utils'

mockNuxtImport<typeof useAutoImportedTarget>('useAutoImportedTarget', () => {
  return () => 'mocked!'
})

it('should mock', () => {
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"mocked!"')
  expect(useAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
})
