import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { it, expect, vi } from 'vitest'

mockNuxtImport(useMessage, vi.fn)

it('plugin', () => {
  expect(useNuxtApp().$message()).toEqual('Hello Nuxt (/)')
})

it('plugin mock', () => {
  vi.mocked(useMessage).mockImplementationOnce(() => 'Mocked!')
  expect(useNuxtApp().$message()).toEqual('Mocked! (/)')
})
