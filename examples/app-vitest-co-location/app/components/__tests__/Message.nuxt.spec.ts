import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { Message } from '#components'

it('should mount with import from alias', async () => {
  const wrapper = await mountSuspended(Message)
  expect(wrapper.text()).toContain('Hello Nuxt')
})
