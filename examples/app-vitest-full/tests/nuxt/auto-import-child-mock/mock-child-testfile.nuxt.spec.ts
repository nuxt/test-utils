import { it, expect } from 'vitest'
import { mockNuxtImport, unmockNuxtImport } from '@nuxt/test-utils/runtime'

unmockNuxtImport(useMessageParent)
mockNuxtImport(useMessageChild1, () => () => ({
  get: () => 'testfile child1 message',
}))

it('should apply mock of child composable using test file', () => {
  const message = useMessageStore()
  expect(message.store.value).toEqual([
    'testfile child1 message',
    'original child2 message',
  ])
})

it('should apply mock of child composable using test file with call', () => {
  const message = useMessageParent()
  expect(message.get1()).toBe('testfile child1 message')
  expect(message.get2()).toBe('original child2 message')
})
