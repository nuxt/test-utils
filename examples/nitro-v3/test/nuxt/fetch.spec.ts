import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { it, expect, describe } from 'vitest'

describe('registerEndpoint tests', () => {
  it('works with h3 v2 syntax', async () => {
    registerEndpoint('/test1/', event => new Response(event.req.headers.get('x-custom-header') || ''))

    const fetchOptions = {
      headers: { 'x-custom-header': 'my-value' },
    }

    expect(await $fetch('/test1/', fetchOptions)).toBe('my-value')
    expect(await fetch('/test1/', fetchOptions).then(r => r.text())).toBe('my-value')
  })
})
