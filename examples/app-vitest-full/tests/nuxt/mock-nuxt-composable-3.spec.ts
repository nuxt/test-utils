import { expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mocks = vi.hoisted(() => ({
  add: vi.fn<typeof add>(() => 123),
}))

mockNuxtImport('useAutoImportedTarget', () => {
  return () => 'mocked'
})

mockNuxtImport('useDefaultExport', () => {
  return () => 'mocked'
})

mockNuxtImport(add, () => mocks.add)

it('should mock composables from project', () => {
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"mocked"')
})

it('should mock composables from project even if it uses `export default`', () => {
  expect(useDefaultExport()).toMatchInlineSnapshot('"mocked"')
})

it('should mock composables with hoisted mocks', () => {
  expect(add(111, 222)).toBe(123)
  expect(mocks.add).toHaveBeenLastCalledWith(111, 222)
})
