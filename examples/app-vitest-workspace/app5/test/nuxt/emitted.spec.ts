import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

describe('emitted', () => {
  it('records events emitted by the mounted component', async () => {
    const component = await mountSuspended(defineComponent({
      emits: ['ping'],
      setup: (_, { emit }) => () => h('button', { onClick: () => emit('ping', 1) }),
    }))
    await component.find('button').trigger('click')
    expect(component.emitted('ping')).toEqual([[1]])
  })
})
