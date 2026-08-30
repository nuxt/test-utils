import { expect, it, vi } from 'vitest'
import { mockNuxtImport, unmockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport(useAutoImportedTarget, () => {
  return () => 'mocked!'
})

mockNuxtImport<typeof useCustomModuleAutoImportedTarget>(
  useCustomModuleAutoImportedTarget,
  () => {
    return () => 'mocked!'
  },
)

mockNuxtImport<typeof useAutoImportSetupOverridenMocked>(
  'useAutoImportSetupOverridenMocked',
  () => () => {
    return 'mocked in test file'
  },
)

it('should mock useAutoImportedTarget', () => {
  vi.fn()
  expect(useAutoImportedTarget()).toBe('mocked!')
})

it('should mock useAutoImportedNonTarget', () => {
  expect(useAutoImportedNonTarget()).toBe('the original')
})

it('should mock useAutoImportSetupOverridenMocked', () => {
  expect(useAutoImportSetupOverridenMocked()).toBe('mocked in test file')
})

it('should mock useAutoImportSetupMocked', () => {
  expect(useAutoImportSetupMocked()).toBe('mocked in setup')
})

it('should mock composable from external package useCustomModuleAutoImportedTarget', () => {
  expect(useCustomModuleAutoImportedTarget()).toBe('mocked!')
})

it('should mock composable from external package useCustomModuleAutoImportedNonTarget', () => {
  expect(useCustomModuleAutoImportedNonTarget()).toBe('the original')
})

unmockNuxtImport(useAutoImportNestedSetupOverridenMocked)
mockNuxtImport(useAutoImportedNestedTargetChild, () => () => 'mocked!')
mockNuxtImport(useAutoImportNestedSetupOverridenMockedChild, () => () => 'mocked in test file')

it('should mock child useAutoImportedNestedTarget', async () => {
  expect(useAutoImportedNestedTarget()).toBe('mocked!')
})

it('should mock child useAutoImportedNestedNonTarget', () => {
  expect(useAutoImportedNestedNonTarget()).toBe('the original')
})

it('should mock child useAutoImportNestedSetupMocked', () => {
  expect(useAutoImportNestedSetupMocked()).toBe('mocked in setup')
})

it('should mock child useAutoImportNestedSetupOverridenMocked', () => {
  expect(useAutoImportNestedSetupOverridenMocked()).toBe('mocked in test file')
})

unmockNuxtImport(useAliasExport2As)
mockNuxtImport(useAliasExport3As, () => () => 'mocked!')

it('should mock aliased import via setup file', () => {
  expect(useAliasExport1As()).toBe('mocked in setup')
})

it('should unmock aliased import', () => {
  expect(useAliasExport2As()).toBe('the original')
})

it('should mock aliased import via test file', () => {
  expect(useAliasExport3As()).toBe('mocked!')
})
