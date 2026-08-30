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

it('should mock', () => {
  vi.fn()
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"mocked!"')
  expect(useAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
  expect(useAutoImportSetupOverridenMocked()).toMatchInlineSnapshot(
    '"mocked in test file"',
  )
  expect(useAutoImportSetupMocked()).toMatchInlineSnapshot('"mocked in setup"')
})

it('should mock composable from external package', () => {
  expect(useCustomModuleAutoImportedTarget()).toMatchInlineSnapshot('"mocked!"')
  expect(useCustomModuleAutoImportedNonTarget()).toMatchInlineSnapshot(
    '"the original"',
  )
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
