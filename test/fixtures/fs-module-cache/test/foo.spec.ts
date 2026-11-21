import { expect, it } from 'vitest'

it('calls auto-imported composables', () => {
  expect(useFoo()).toBe('foo')
  expect(useBar()).toBe(process.env.NUXT_TEST_BAR || 'one')
  expect(useBaz()).toBe(process.env.NUXT_TEST_BAZ || 'one')
})
