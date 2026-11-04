import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { dequal } from 'dequal'

describe('optimizeDeps', () => {
  it('can import a dependency that is not pre-bundled', async () => {
    const component = await mountSuspended(defineComponent({
      render: () => h('div', String(dequal({ a: 1 }, { a: 1 }))),
    }))
    expect(component.text()).toBe('true')
  })
})
