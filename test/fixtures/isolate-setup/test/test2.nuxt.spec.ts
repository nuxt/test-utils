import { expect, test } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { NuxtPage } from '#components'

test('test2', async () => {
  const page = await mountSuspended(NuxtPage, {
    route: {
      query: { name: 'Test2' },
    },
  })
  expect(page.html()).toContain('Hello Test2!')
})
