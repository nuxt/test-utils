import { describe, expect, it } from 'vitest'

import { mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'
import App from '~/app.vue'

describe('Mounting app with `@nuxtjs/i18n`', () => {
  it('can mount some component', async () => {
    const component = await mountSuspended(App)
    expect(component.vm).toBeTruthy()
    expect(component.text()).toMatchInlineSnapshot(
      `"Hi from @nuxtjs/i18n: $t(from the en locale) t(from the en locale)"`,
    )
  })

  it('can render some component', async () => {
    const { container } = await renderSuspended(App)
    expect(container.textContent.trim()).toMatchInlineSnapshot(
      `"Hi from @nuxtjs/i18n: $t(from the en locale) t(from the en locale)"`,
    )
  })
})
