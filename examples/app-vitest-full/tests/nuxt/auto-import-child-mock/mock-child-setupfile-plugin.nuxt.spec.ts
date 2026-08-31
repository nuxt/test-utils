import { it, expect } from 'vitest'

it('should apply child mock to plugin from setup file', () => {
  const { $messageStorePlugin } = useNuxtApp()
  expect($messageStorePlugin.store.value).toEqual([
    'setupfile child1 message',
    'setupfile child2 message',
  ])
})

it('should call child mock in plugin from setup file', () => {
  const { $messageStorePlugin } = useNuxtApp()
  $messageStorePlugin.push1()
  $messageStorePlugin.push2()
  expect($messageStorePlugin.store.value).toEqual([
    'setupfile child1 message',
    'setupfile child2 message',
    'setupfile child1 message',
    'setupfile child2 message',
  ])
})
