import { beforeEach, describe, expect, it } from 'vitest'

import { mountSuspended } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'
import OptionsComponent from '~/components/OptionsComponent.vue'
import WrapperTests from '~/components/WrapperTests.vue'

import type { VueWrapper} from '@vue/test-utils';
import { mount } from '@vue/test-utils'

import ExportDefaultComponent from '~/components/ExportDefaultComponent.vue'
import ExportDefineComponent from '~/components/ExportDefineComponent.vue'
import ExportDefaultWithRenderComponent from '~/components/ExportDefaultWithRenderComponent.vue'
import ExportDefaultReturnsRenderComponent from '~/components/ExportDefaultReturnsRenderComponent.vue'

import { BoundAttrs } from '#components'

const formats = {
  ExportDefaultComponent,
  ExportDefineComponent,
  ExportDefaultWithRenderComponent,
  ExportDefaultReturnsRenderComponent,
}

describe('mountSuspended', () => {
  it('can mount components within nuxt suspense', async () => {
    const component = await mountSuspended(App)
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>This is an auto-imported component</div>
      <div> I am a global component </div>
      <div>Index page</div>
      <a href="/test"> Test link </a>"
    `)
  })

  it('should handle passing setup state and props to template', async () => {
    const wrappedComponent = await mountSuspended(BoundAttrs)
    const component = mount(BoundAttrs)

    expect(component.html()).toEqual(wrappedComponent.html())
  })

  it('should work with shallow mounting within suspense', async () => {
    const component = await mountSuspended(App, { shallow: true })
    expect(component.html()).toMatchInlineSnapshot(`
      "<async-component-wrapper-stub></async-component-wrapper-stub>
      <anonymous-stub></anonymous-stub>
      <nuxt-page-stub></nuxt-page-stub>
      <nuxt-link-stub to="/test"></nuxt-link-stub>"
    `)
  })

  it('should render default props within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent)
    expect(component.find('h2').html()).toMatchInlineSnapshot(
      '"<h2>The original</h2>"'
    )
  })

  it('should render passed props within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent, {
      props: {
        title: 'title from mount suspense props',
      },
    })
    expect(component.find('h2').html()).toMatchInlineSnapshot(
      '"<h2>title from mount suspense props</h2>"'
    )
  })

  it('can pass slots to mounted components within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent, {
      slots: {
        default: () => 'slot from mount suspense',
      },
    })
    expect(component.find('div').html()).toMatchInlineSnapshot(
      '"<div>slot from mount suspense</div>"'
    )
  })

  it('can receive emitted events from components mounted within nuxt suspense', async () => {
    const component = await mountSuspended(WrapperTests)
    component.find('button#emitCustomEvent').trigger('click')
    expect(component.emitted()).toMatchInlineSnapshot(`
      {
        "customEvent": [
          [
            "foo",
          ],
        ],
        "otherEvent": [
          [],
        ],
      }
    `)
  })

  // This test works (you can delete it later)
  it('can receive emitted events from components using defineModel', () => {
    const component = mount(WrapperTests)
    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toHaveProperty('update:modelValue')
  })

  // FIXME: fix this failing test
  it.todo('can receive emitted events from components mounted within nuxt suspense using defineModel', async () => {
    const component = await mountSuspended(WrapperTests)
    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toHaveProperty('update:modelValue')
  })

  it('can access exposed methods/refs from components mounted within nuxt suspense', async () => {
    const component = await mountSuspended(WrapperTests)
    expect(component.vm.testExpose?.()).toBe('expose was successful')
    // @ts-expect-error FIXME: someRef is typed as unwrapped
    expect(component.vm.someRef.value).toBe('thing')
  })
})

describe.each(Object.entries(formats))(`%s`, (name, component) => {
  let wrapper: VueWrapper<any>

  beforeEach(async () => {
    wrapper = await mountSuspended(component, {
      props: {
        myProp: 'Hello nuxt-vitest',
      },
    })
  })

  it('mounts with props', () => {
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre>
</div>
    `.trim())
  })

  it('can be updated with setProps', async () => {
    await wrapper.setProps({
       myProp: 'updated title'
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre>
</div>
    `.trim())
  })
})
