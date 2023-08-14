import { expect, it, vi } from 'vitest'
import { mockNuxtImport } from 'vitest-environment-nuxt/utils'

mockNuxtImport<typeof useAutoImportedTarget>('useAutoImportedTarget', () => {
  return () => 'mocked!'
})

mockNuxtImport<typeof useCustomModuleAutoImportedTarget>('useCustomModuleAutoImportedTarget', () => {
  return () => 'mocked!'
})

mockNuxtImport<typeof useAutoImportSetupOverridenMocked>('useAutoImportSetupOverridenMocked', () => () => {
  return 'mocked in test file'
})

it('should mock', () => {
  vi.fn()
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"mocked!"')
  expect(useAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
  expect(useAutoImportSetupOverridenMocked()).toMatchInlineSnapshot('"mocked in test file"')
  expect(useAutoImportSetupMocked()).toMatchInlineSnapshot('"mocked in setup"')
})

it('should mock composable from external package', () => {
  expect(useCustomModuleAutoImportedTarget()).toMatchInlineSnapshot('"mocked!"')
  expect(useCustomModuleAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
})
