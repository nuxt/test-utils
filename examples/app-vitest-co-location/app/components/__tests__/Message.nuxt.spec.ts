import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { Message } from '#components'

it('should mount', async () => {
  const wrapper = await mountSuspended(Message)
  expect(wrapper.text()).toContain('Hello Nuxt')
})
