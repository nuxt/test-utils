import { describe, it, expect } from 'vitest'

import pure from 'example-use-cjs-cjs-pure'
import wrap from 'example-use-cjs-cjs-wrapper'

describe('import cjs default', () => {
  it('pure', () => {
    expect(pure.hello()).toBe('hello')
  })

  it('wrapper', () => {
    expect(wrap.hello()).toBe('hello')
  })
})
