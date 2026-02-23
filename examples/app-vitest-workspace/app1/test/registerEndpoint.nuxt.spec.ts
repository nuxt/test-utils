import { describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

registerEndpoint('/register/endpoint/in-test-file', () => 'test-file')

describe('registerEndpoint', () => {
  it('registerEndpoint in setup file', async () => {
    expect(await $fetch<string>('/register/endpoint/in-setup-file')).toBe('setup-file')
  })

  it('registerEndpoint in test file', async () => {
    expect(await $fetch<string>('/register/endpoint/in-test-file')).toBe('test-file')
  })

  it('registerEndpoint in test suite', async () => {
    registerEndpoint('/register/endpoint/in-test-suite', () => 'test-suite')
    expect(await $fetch<string>('/register/endpoint/in-test-suite')).toBe('test-suite')
  })
})
