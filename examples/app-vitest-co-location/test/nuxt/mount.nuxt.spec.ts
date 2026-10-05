import { it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

import { Message } from '#components'

mockNuxtImport(useMessage, vi.fn)

it('should mount', async () => {
  vi.mocked(useMessage).mockImplementationOnce(() => 'Mocked!')
  const wrapper = await mountSuspended(Message)
  expect(wrapper.text()).toContain('Mocked!')
})
