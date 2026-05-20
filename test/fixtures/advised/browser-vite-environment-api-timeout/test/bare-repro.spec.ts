import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

const BareRepro = defineComponent({
  render() {
    return h('div', 'bare browser repro')
  },
})

describe('bare browser repro', () => {
  it('mounts the component', async () => {
    const component = await mountSuspended(BareRepro)

    expect(component.text()).toContain('bare browser repro')
  })
})