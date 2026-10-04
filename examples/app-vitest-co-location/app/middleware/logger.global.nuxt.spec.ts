import { it, expect } from 'vitest'
import middleware from './logger.global'

it('middleware', () => {
  expect(middleware(useRoute(), useRoute())).toBeUndefined()
})
