import { it, expect } from 'vitest'
import plugin from './message'

it('plugin', () => {
  expect(plugin(useNuxtApp())).toEqual({
    provide: {
      message: 'Hello Nuxt (/)',
    },
  })
})
