import { expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'

import GlobalComponent from '~/components/GlobalComponent.global.vue'

mockNuxtImport('useHead', () => {
  return () => true
})

mockNuxtImport(useGlobalComponentMessage, () => () => ({
  message: '(mock) I am a global component',
}))

it('should mock core nuxt composables', () => {
  expect(useHead({})).toMatchInlineSnapshot('true')
})

it('should mock composables used in app.vue components with mountSuspended', async () => {
  const wrapper = await mountSuspended(GlobalComponent)
  expect(wrapper.html()).toContain('(mock) I am a global component')
})

it('should mock composables used in app.vue components with renderSuspended', async () => {
  const wrapper = await renderSuspended(GlobalComponent)
  expect(wrapper.html()).toContain('(mock) I am a global component')
})
