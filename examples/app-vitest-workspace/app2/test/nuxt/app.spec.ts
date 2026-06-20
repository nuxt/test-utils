import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('useAppConfig', () => {
    expect(
      Object.keys(useAppConfig()).toSorted(),
    ).toEqual(['nuxt', 'ui', 'icon'].toSorted())
  })

  it('useRuntimeConfig', () => {
    expect(useRuntimeConfig().icon).toBeDefined()
  })

  it('should exist the app root element', () => {
    const element = document.getElementById('nuxt-test')
    expect(element).toBeTruthy()
    expect(element?.tagName).toBe('DIV')
  })
})
