import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import { Hello } from '#components'

it('should disable feature in unit tests', async () => {
  const wrapper = await mountSuspended(Hello)
  expect(wrapper.attributes('data-testid')).toBe('hello')
  expect(wrapper.attributes('data-test')).toBe('world')
})
