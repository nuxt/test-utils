import { afterEach, describe, expect, it } from 'vitest'
import { render, cleanup } from '@testing-library/vue'
import { renderSuspended } from '@nuxt/test-utils/runtime'

import CompostionApi from '~/components/TestComponentWithCompostionApi.vue'
import OptionsApiWithData from '~/components/TestComponentWithOptionsApiWithData.vue'
import OptionsApiWithSetup from '~/components/TestComponentWithOptionsApiWithSetup.vue'

type Options<T> = Parameters<typeof renderSuspended<T>>[1]

function testWrapHtml(html: string) {
  return [
    '<div id="test-wrapper">',
    ...html.split('\n').map(s => `  ${s}`),
    '</div>',
  ].join('\n')
}

describe('renderSuspended() compatible to render()', () => {
  afterEach(() => {
    cleanup()
  })

  describe.each([
    { Component: CompostionApi, type: 'CompostionApi', description: '<script setup>' } as const,
    { Component: OptionsApiWithData, type: 'OptionsApi', description: '<script> defineComponent with data' } as const,
    { Component: OptionsApiWithSetup, type: 'OptionsApi', description: '<script> defineComponent with setup' } as const,
  ])('$description', ({ Component }) => {
    it.each([
      'hello',
      () => 'hello',
      { template: '<span>hello</span>' },
    ] as const)('html() slot(%o)', async (slot) => {
      const options: Options<typeof Component> = {
        attrs: { class: 'c', title: 'title' },
        props: { modelValue: 'hello' },
        slots: { default: slot },
      }

      const vWrapper = render(Component, options)
      const nWrapper = await renderSuspended(Component, options)

      expect(nWrapper.html()).toBe(testWrapHtml(vWrapper.html()))
    })
  })

  describe('defineComponent', () => {
    it('setup and render', async () => {
      const component = defineComponent({
        setup() {
          const data1 = ref([...'hello'])
          const data2 = [...'world']
          return { data1, data2 }
        },
        render() {
          return h('div', [this.data1.join(''), ' ', this.data2.join('')])
        },
      })

      const vWrapper = render(component)
      const nWrapper = await renderSuspended(component)

      expect(nWrapper.html()).toBe(testWrapHtml(vWrapper.html()))
    })

    it('setup and template', async () => {
      const component = defineComponent({
        setup() {
          const data1 = ref('hello')
          const data2 = 'world'
          return { data1, data2 }
        },
        template: '<div>{{ data1 }} {{ data2 }}</div>',
      })

      const vWrapper = render(component)
      const nWrapper = await renderSuspended(component)

      expect(nWrapper.html()).toBe(testWrapHtml(vWrapper.html()))
    })
  })
})
