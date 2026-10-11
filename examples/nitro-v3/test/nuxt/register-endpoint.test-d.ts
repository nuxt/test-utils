import { expectTypeOf, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import type { H3Event } from 'nitro/h3'

it('types handlers with the project h3 version', () => {
  registerEndpoint('/test', (event) => {
    expectTypeOf(event).toEqualTypeOf<H3Event>()
    expectTypeOf(event.url).toEqualTypeOf<URL>()
  })
})
