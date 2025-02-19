import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import SlugPage from '~/pages/other/[slug].vue'

describe('mounting components', () => {
  // https://github.com/nuxt/test-utils/issues/594
  it('mounts a dynamic route', async () => {
    const component = mount(SlugPage)
    expect(component.html()).toMatchInlineSnapshot(`"<div></div>"`)
  })
})
