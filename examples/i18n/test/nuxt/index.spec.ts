import { describe, expect, it } from 'vitest'

import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from '~/app.vue'

describe('Mounting app with `@nuxtjs/i18n`', () => {
  it('can mount some component', async () => {
    const component = await mountSuspended(App)
    expect(component.vm).toBeTruthy()
    expect(component.text()).toMatchInlineSnapshot(
      `"Hi from @nuxtjs/i18n: from the en locale"`,
    )
  })
})
