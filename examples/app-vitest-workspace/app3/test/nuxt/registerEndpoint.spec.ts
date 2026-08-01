import { describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

describe('registerEndpoint', () => {
  it('should mock GET endpoint', async () => {
    registerEndpoint('/api/test', () => 'test1')
    await expect($fetch('/api/test')).resolves.toBe('test1')
  })

  it('should mock POST endpoint', async () => {
    registerEndpoint('/api/test', {
      method: 'POST',
      handler: () => 'test2',
    })
    await expect($fetch('/api/test', { method: 'post' })).resolves.toBe('test2')
  })
})
