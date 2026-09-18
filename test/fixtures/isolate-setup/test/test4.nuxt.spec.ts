import { expect, test } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { NuxtPage } from '#components'

test('test4', async () => {
  const page = await mountSuspended(NuxtPage, {
    route: {
      query: { name: 'Test4' },
    },
  })
  expect(page.html()).toContain('Hello Test4!')
})
