import { expect, test } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { NuxtPage } from '#components'

test('test1', async () => {
  const page = await mountSuspended(NuxtPage, {
    route: {
      query: { name: 'Test1' },
    },
  })
  expect(page.html()).toContain('Hello Test1!')
})
