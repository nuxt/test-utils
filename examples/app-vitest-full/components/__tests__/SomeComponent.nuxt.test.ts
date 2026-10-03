import { it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { SomeComponent } from '#components'

it('mount SomeComponent', async () => {
  const wrapper = await mountSuspended(SomeComponent)
  expect(wrapper.text()).toContain('This is an auto-imported component')
})
