import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import MyComponent from '~/components/MyComponent.vue'

it('MyComponent', async () => {
  const wrapper = await mountSuspended(MyComponent, {
    props: {
      title: 'Hello',
    },
  })

  expect(wrapper.text()).toBe('Hello')
})
