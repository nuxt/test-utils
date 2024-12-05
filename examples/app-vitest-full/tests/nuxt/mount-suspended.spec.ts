import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { mountSuspended } from '@nuxt/test-utils/runtime'

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import App from '~/app.vue'
import OptionsComponent from '~/components/OptionsComponent.vue'
import WrapperTests from '~/components/WrapperTests.vue'
import LinkTests from '~/components/LinkTests.vue'

import ExportDefaultComponent from '~/components/ExportDefaultComponent.vue'
import ExportDefineComponent from '~/components/ExportDefineComponent.vue'
import ExportDefaultWithRenderComponent from '~/components/ExportDefaultWithRenderComponent.vue'
import ExportDefaultReturnsRenderComponent from '~/components/ExportDefaultReturnsRenderComponent.vue'
import OptionsApiPage from '~/pages/other/options-api.vue'
import ComponentWithReservedProp from '~/components/ComponentWithReservedProp.vue'
import ComponentWithReservedState from '~/components/ComponentWithReservedState.vue'
import ComponentWithImports from '~/components/ComponentWithImports.vue'

import { BoundAttrs } from '#components'
import DirectiveComponent from '~/components/DirectiveComponent.vue'

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

  it('should work with #imports', async () => {
    const comp = await mountSuspended(ComponentWithImports)
    const span = comp.find('span')
    expect(span.text()).toBe('should work with #imports')
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
      '"<h2>The original</h2>"',
    )
  })

  it('should render passed props within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent, {
      props: {
        title: 'title from mount suspense props',
      },
    })
    expect(component.find('h2').html()).toMatchInlineSnapshot(
      '"<h2>title from mount suspense props</h2>"',
    )
  })

  it('can pass slots to mounted components within nuxt suspense', async () => {
    const component = await mountSuspended(OptionsComponent, {
      slots: {
        default: () => 'slot from mount suspense',
      },
    })
    expect(component.find('div').html()).toMatchInlineSnapshot(
      '"<div>slot from mount suspense</div>"',
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

  it('can receive emitted events from components using defineModel', () => {
    const component = mount(WrapperTests)
    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toHaveProperty('update:modelValue')
  })

  it('can receive emitted events from components mounted within nuxt suspense using defineModel', async () => {
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

  it('respects directives registered in nuxt plugins', async () => {
    const component = await mountSuspended(DirectiveComponent)
    expect(component.html()).toMatchInlineSnapshot(`"<div data-directive="true"></div>"`)
  })

  it('can handle reserved words in component props', async () => {
    const comp = await mountSuspended(ComponentWithReservedProp, {
      props: {
        error: '404',
      },
    })
    const span = comp.find('span')
    expect(span.text()).toBe('404')

    await comp.setProps({
      error: '500',
    })
    expect(span.text()).toBe('500')
  })

  it('can handle reserved words in setup state', async () => {
    const comp = await mountSuspended(ComponentWithReservedState)
    const span = comp.find('span')
    expect(span.text()).toBe('false')
  })

  describe('Options API', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation((message) => {
        console.log('[spy] console.error has been called', message)
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should render asyncData and other options api properties within nuxt suspense', async () => {
      const component = await mountSuspended(OptionsApiPage)
      expect(component.find('[data-testid="greeting-in-setup"]').text()).toBe('Hello, setup')
      expect(component.find('[data-testid="greeting-in-data1"]').text()).toBe('Hello, data1')
      expect(component.find('[data-testid="greeting-in-data2"]').text()).toBe('Hello, overwritten by asyncData')
      expect(component.find('[data-testid="greeting-in-computed"]').text()).toBe('Hello, computed property')
      expect(component.find('[data-testid="computed-data1"]').text()).toBe('Hello, data1')
      expect(component.find('[data-testid="computed-greeting-in-methods"]').text()).toBe('Hello, method')
      expect(component.find('[data-testid="greeting-in-methods"]').text()).toBe('Hello, method')
      expect(component.find('[data-testid="return-data1"]').text()).toBe('Hello, data1')
      expect(component.find('[data-testid="return-computed-data1"]').text()).toBe('Hello, data1')
    })

    it('should not output error when button in page is clicked', async () => {
      const component = await mountSuspended(OptionsApiPage)
      await component.find('[data-testid="button-in-page"]').trigger('click')
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should not output error when button in component is clicked', async () => {
      const component = await mountSuspended(OptionsApiPage)
      await component.find('[data-testid="test-button"]').trigger('click')
      expect(console.error).not.toHaveBeenCalled()
    })
  })
})

describe.each(Object.entries(formats))(`%s`, (name, component) => {
  let wrapper: VueWrapper<unknown>

  beforeEach(async () => {
    wrapper = await mountSuspended(component, {
      props: {
        myProp: 'Hello nuxt-vitest',
        myArrayProp: ['hello', 'nuxt', 'vitest'],
      },
    })
  })

  it('mounts with props', () => {
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span>
</div>
    `.trim())
  })

  it('can be updated with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span>
</div>
    `.trim())
  })

  it('can be updated array with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
      myArrayProp: ['updated', 'prop'],
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>updated</span><span>prop</span>
</div>
    `.trim())
  })
})

it('renders links correctly', async () => {
  const component = await mountSuspended(LinkTests)

  expect(component.html()).toMatchInlineSnapshot(`"<div><a href="/test"> Link with string to prop </a><a href="/test"> Link with object to prop </a></div>"`)
})
