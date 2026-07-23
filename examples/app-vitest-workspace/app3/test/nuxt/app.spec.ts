import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('should exist the app root element', () => {
    const element = document.getElementById('__test_root')
    expect(element).toBeTruthy()
    expect(element?.tagName).toBe('MAIN')
  })

  it('should exist the app teleport element', () => {
    const element = document.getElementById('__test_teleport')
    expect(element).toBeTruthy()
    expect(element?.tagName).toBe('P')
  })
})
