/** @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest'
// @ts-expect-error virtual module
import { baseURL, buildAssetsDir } from '#internal/nuxt/paths'

describe('generated paths module', () => {
  it('resolves outside the nuxt environment', () => {
    expect(() => baseURL()).not.toThrow()
    expect(() => buildAssetsDir()).not.toThrow()
  })
})
