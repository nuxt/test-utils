import { vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport(useAutoImportSetupMocked,
  () =>
    vi.fn(() => {
      return 'mocked in setup'
    }),
)

mockNuxtImport<typeof useAutoImportSetupOverridenMocked>(
  'useAutoImportSetupOverridenMocked',
  () =>
    vi.fn(() => {
      return 'mocked in setup'
    }),
)

mockNuxtImport(useAutoImportNestedSetupMocked,
  () =>
    vi.fn(() => {
      return 'mocked in setup'
    }),
)

mockNuxtImport(useAutoImportNestedSetupOverridenMocked,
  () =>
    vi.fn(() => {
      return 'mocked in setup'
    }),
)
