import { vi } from 'vitest'
import { mockNuxtImport } from 'vitest-environment-nuxt/utils'

mockNuxtImport<typeof useAutoImportSetupMocked>(
  'useAutoImportSetupMocked',
  () =>
    vi.fn(() => {
      return 'mocked in setup'
    })
)

mockNuxtImport<typeof useAutoImportSetupOverridenMocked>(
  'useAutoImportSetupOverridenMocked',
  () =>
    vi.fn(() => {
      return 'mocked in setup'
    })
)
