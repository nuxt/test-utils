import { it, expect } from 'vitest'

it('should apply child mock from setup file', () => {
  const message = useMessageStore()
  expect(message.store.value).toEqual([
    'setupfile child1 message',
    'setupfile child2 message',
  ])
})

it('should call child mock from setup file', () => {
  const message = useMessageParent()
  expect(message.get1()).toBe('setupfile child1 message')
  expect(message.get2()).toBe('setupfile child2 message')
})
