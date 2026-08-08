import { describe, it, expect } from 'vitest'

import * as pure from 'example-use-cjs-cjs-pure'
import * as wrap from 'example-use-cjs-cjs-wrapper'

describe('import cjs namespace', () => {
  it('pure', () => {
    expect(pure.hello()).toBe('hello')
  })

  it('wrapper', () => {
    expect(wrap.hello()).toBe('hello')
  })
})
