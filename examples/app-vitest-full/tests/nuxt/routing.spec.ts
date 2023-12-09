import { describe, expect, it } from 'vitest'

import { mountSuspended } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'

describe('routing', () => {
  it('defaults to index page', async () => {
    expect(useRoute().matched[0].meta).toMatchInlineSnapshot(`
      {
        "value": "set in index",
      }
    `)
  })

  it('allows pushing to other pages', async () => {
    await navigateTo('/something')
    expect(useNuxtApp().$router.currentRoute.value.path).toEqual('/something')
    await nextTick()
    expect(useRoute().path).toEqual('/something')
  })

  it('handles nuxt routing', async () => {
    const component = await mountSuspended(App, { route: '/test' })
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>This is an auto-imported component</div>
      <div> I am a global component </div>
      <div>/test</div>
      <a href="/test"> Test link </a>"
    `)
  })
})
