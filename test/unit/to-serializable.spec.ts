import { describe, expect, it } from 'vitest'

import { toSerializable } from '../../src/utils.ts'

describe('toSerializable', () => {
  it('should keep plain values and report the paths of values that cannot be serialized', () => {
    const source: Record<string, unknown> = {
      ssr: false,
      app: { head: { title: 'title' } },
      hooks: { ready: () => {} },
      modules: ['a', () => {}, undefined, 'b'],
      build: { transpile: [/foo/] },
    }
    source.self = source

    expect(toSerializable(source)).toEqual({
      value: {
        ssr: false,
        app: { head: { title: 'title' } },
        hooks: {},
        modules: ['a', 'b'],
        build: { transpile: [] },
      },
      omitted: ['hooks.ready', 'modules[1]', 'build.transpile[0]', 'self'],
    })
  })
})
