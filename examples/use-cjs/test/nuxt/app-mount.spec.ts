import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'

describe('mount app', () => {
  it('can mount app.vue', async () => {
    const wrapper = await mountSuspended(App)
    const ps = wrapper.findAll('p')

    expect(ps).toHaveLength(8)
    expect([...new Set(ps.map(p => p.text()))]).toEqual(['hello'])
  })
})
