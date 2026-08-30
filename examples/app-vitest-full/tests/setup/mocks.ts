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

mockNuxtImport(useMessageParent, () => () => ({
  get1: () => 'setupfile child1 message',
  get2: () => 'setupfile child2 message',
}))
