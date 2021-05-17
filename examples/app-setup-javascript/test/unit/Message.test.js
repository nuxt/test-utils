import { mount } from '@vue/test-utils'
import Message from '@/components/Message.vue'

describe('Message', () => {
  test('displays default message', () => {
    const wrapper = mount(Message)

    expect(wrapper.text()).toContain('Hello world!')
  })

  test('displays custom message', () => {
    const wrapper = mount(Message, {
      propsData: {
        text: 'Custom test message'
      }
    })

    expect(wrapper.text()).toContain('Custom test message')
  })
})
