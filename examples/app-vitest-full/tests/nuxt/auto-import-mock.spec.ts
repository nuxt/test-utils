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

it('should mock composable', () => {
  vi.fn()
  expect(useAutoImportedTarget()).toBe('mocked!')
})

it('should not mock non-target composable', () => {
  expect(useAutoImportedNonTarget()).toBe('the original')
})

it('should override mock from setup file', () => {
  expect(useAutoImportSetupOverridenMocked()).toBe('mocked in test file')
})

it('should apply mock from setup file', () => {
  expect(useAutoImportSetupMocked()).toBe('mocked in setup')
})

it('should mock custom module composable', () => {
  expect(useCustomModuleAutoImportedTarget()).toBe('mocked!')
})

it('should not mock non-target custom module composable', () => {
  expect(useCustomModuleAutoImportedNonTarget()).toBe('the original')
})

unmockNuxtImport(useAutoImportNestedSetupOverridenMocked)
mockNuxtImport(useAutoImportedNestedTargetChild, () => () => 'mocked!')
mockNuxtImport(useAutoImportNestedSetupOverridenMockedChild, () => () => 'mocked in test file')

it('should mock nested composable', async () => {
  expect(useAutoImportedNestedTarget()).toBe('mocked!')
})

it('should not mock non-target nested composable', () => {
  expect(useAutoImportedNestedNonTarget()).toBe('the original')
})

it('should apply nested mock from setup file', () => {
  expect(useAutoImportNestedSetupMocked()).toBe('mocked in setup')
})

it('should unmock and mock child composable', () => {
  expect(useAutoImportNestedSetupOverridenMocked()).toBe('mocked in test file')
})

unmockNuxtImport(useAliasExport2As)
mockNuxtImport(useAliasExport3As, () => () => 'mocked!')

it('should mock aliased import from setup file', () => {
  expect(useAliasExport1As()).toBe('mocked in setup')
})

it('should unmock aliased import', () => {
  expect(useAliasExport2As()).toBe('the original')
})

it('should mock aliased import in test file', () => {
  expect(useAliasExport3As()).toBe('mocked!')
})
