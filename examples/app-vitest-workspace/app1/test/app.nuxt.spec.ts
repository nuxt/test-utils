import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('useAppConfig', () => {
    expect(Object.keys(useAppConfig())).toEqual(['nuxt'])
  })

  it('__NUXT_VITEST_RESOLVED__ is true', () => {
    // @ts-expect-error injected global, not typed
    expect(__NUXT_VITEST_RESOLVED__).toBe(true)
  })

  it('should exist the app root element', () => {
    const element = document.getElementById('__nuxt')
    expect(element).toBeTruthy()
    expect(element?.tagName).toBe('DIV')
    expect(element?.getAttribute('class')).toBe('nuxt-root-class')
    expect(element?.getAttribute('style')).toBe('')
    expect(element?.getAttribute('tabindex')).toBe('0')
    expect(element?.getAttribute('spellcheck')).toBe('')
    expect(element?.getAttribute('draggable')).toBe('true')
  })

  it('should exist the app teleport element', () => {
    const element = document.getElementById('teleports')
    expect(element).toBeTruthy()
    expect(element?.tagName).toBe('DIV')
    expect(element?.getAttribute('class')).toBe('teleport-class')
    expect(element?.getAttribute('style')).toBe(null)
    expect(element?.getAttribute('tabindex')).toBe('-1')
    expect(element?.getAttribute('spellcheck')).toBe(null)
    expect(element?.getAttribute('draggable')).toBe('')
  })
})
