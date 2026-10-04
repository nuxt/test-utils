import { it, expect, vi } from 'vitest'
import middleware from './logger.global'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport(useRoute, vi.fn)

it('middleware', () => {
  const spy = vi.spyOn(console, 'log')
  expect(middleware(useRoute(), useRoute())).toBeUndefined()
  expect(spy).toHaveBeenCalledExactlyOnceWith('/', '/')
})
