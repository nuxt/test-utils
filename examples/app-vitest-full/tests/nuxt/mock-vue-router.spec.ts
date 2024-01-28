import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Index from '~/pages/router/route.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    meta: {},
    path: '/123',
    query: {},
  })),
}))

describe('Index', async () => {
  const wrapper = await mountSuspended(Index)

  it('should render correctly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
})
