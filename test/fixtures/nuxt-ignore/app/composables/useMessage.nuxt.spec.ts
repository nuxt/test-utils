import { it, expect } from 'vitest'
import { useMessage } from './useMessage'

export function useMessageSpec() {}

it('useMessage', () => {
  expect(useMessage()).toBe('Hello Nuxt')
})
