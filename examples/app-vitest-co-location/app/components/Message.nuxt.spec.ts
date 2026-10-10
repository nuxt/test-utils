import { it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'

import Message from './Message.vue'

mockNuxtImport(useMessage, vi.fn)

it('should mount', async () => {
  vi.mocked(useMessage).mockImplementationOnce(() => 'Mocked!')
  const wrapper = await mountSuspended(Message)
  expect(wrapper.text()).toContain('Mocked!')
})
