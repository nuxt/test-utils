import { it, expect } from 'vitest'
import { mockNuxtImport, unmockNuxtImport } from '@nuxt/test-utils/runtime'

unmockNuxtImport(useMassageParent)
mockNuxtImport(useMessageChild1, () => () => ({
  get: () => 'testfile child1 message',
}))

it('should apply mock of child composable to plugin using test file', () => {
  const { $messageStorePlugin } = useNuxtApp()
  expect($messageStorePlugin.store.value).toEqual([
    'testfile child1 message',
    'original child2 message',
  ])
})

it('should call mock of child composable to plugin using test file', () => {
  const { $messageStorePlugin } = useNuxtApp()
  $messageStorePlugin.push1()
  $messageStorePlugin.push2()
  expect($messageStorePlugin.store.value).toEqual([
    'testfile child1 message',
    'original child2 message',
    'testfile child1 message',
    'original child2 message',
  ])
})
