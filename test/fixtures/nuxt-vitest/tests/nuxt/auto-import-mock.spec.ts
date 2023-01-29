import { expect, it, vi } from 'vitest'
import { mockNuxtImport } from 'vitest-environment-nuxt/utils'

mockNuxtImport<typeof useAutoImportedTarget>('useAutoImportedTarget', () => {
  return () => 'mocked!'
})

it('should mock', () => {
  vi.fn()
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"mocked!"')
  expect(useAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
})
