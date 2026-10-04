import { it, expect } from 'vitest'
import { useMessage } from './useMessage'

it('useMessage', () => {
  expect(useMessage()).toBe('Hello Nuxt')
})
