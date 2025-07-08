import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { satisfies } from 'semver'
import { version as nuxtVersion } from 'nuxt/package.json'

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
import ScriptSetupEmits from '~/components/ScriptSetupEmits.vue'
import ScriptSetupWatch from '~/components/ScriptSetupWatch.vue'
import OptionsApiPage from '~/pages/other/options-api.vue'
import OptionsApiComputed from '~/components/OptionsApiComputed.vue'
import ComponentWithAttrs from '~/components/ComponentWithAttrs.vue'
import ComponentWithReservedProp from '~/components/ComponentWithReservedProp.vue'
import ComponentWithReservedState from '~/components/ComponentWithReservedState.vue'
import ComponentWithImports from '~/components/ComponentWithImports.vue'

import { BoundAttrs } from '#components'
import DirectiveComponent from '~/components/DirectiveComponent.vue'
import CustomComponent from '~/components/CustomComponent.vue'
import WrapperElement from '~/components/WrapperElement.vue'

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
    const stubName = satisfies(nuxtVersion, '^3') ? 'anonymous-stub' : 'global-component-stub'
    expect(component.html()).toMatchInlineSnapshot(`
      "<async-component-wrapper-stub></async-component-wrapper-stub>
      <${stubName}></${stubName}>
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

  it('can receive emitted events from components mounted within nuxt suspense using defineModel after prop changes and multiple interactions', async () => {
    const component = await mountSuspended(WrapperTests)

    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toMatchInlineSnapshot(`
      {
        "update:modelValue": [
          [
            true,
          ],
        ],
      }
    `)

    await component.setProps({ modelValue: true })

    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toMatchInlineSnapshot(`
      {
        "update:modelValue": [
          [
            true,
          ],
        ],
      }
    `)

    await component.setProps({ modelValue: false })

    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toMatchInlineSnapshot(`
      {
        "update:modelValue": [
          [
            true,
          ],
          [
            true,
          ],
        ],
      }
    `)
  })

  it('can pass onUpdate event to components using defineModel', async () => {
    const component = await mountSuspended(WrapperTests, {
      props: {
        'onUpdate:modelValue': async e => component.setProps({ modelValue: e }),
      },
    })

    component.find('button#changeModelValue').trigger('click')
    expect(component.emitted()).toHaveProperty('update:modelValue')
    await nextTick()
    expect(component.props('modelValue')).toBe(true)
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

  it('respects custom component registered in nuxt plugins', async () => {
    const component = await mountSuspended(CustomComponent)
    expect(component.html()).toMatchInlineSnapshot(`"<button data-testid="test-button"> Button in TestButton component </button>"`)
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

  it('should define $attrs', async () => {
    const component = await mountSuspended(ComponentWithAttrs, { attrs: { foo: 'bar' } })
    expect(component.find('[foo="bar"]').exists()).toBe(true)
  })

  it('should capture emits from script setup and early hooks', async () => {
    const component = await mountSuspended(ScriptSetupEmits)
    await expect.poll(() => component.emitted()).toEqual({
      'event-from-setup': [[1], [2]],
      'event-from-before-mount': [[1], [2]],
      'event-from-mounted': [[1], [2]],
    })
  })

  it('should handle data set from immediate watches', async () => {
    const component = await mountSuspended(ScriptSetupWatch)
    await expect.poll(
      () =>
        JSON.parse(component.find('[data-testid="set-by-watches"]').text()),
    ).toEqual({
      dataFromWatchEffectOnComputedFromReactiveObject: 'data-from-reactive-object',
      dataFromWatchEffectOnReactiveObject: 'data-from-reactive-object',
      dataFromWatchEffectOnReactiveString: 'data-from-reactive-string',
      dataFromWatchOnComputedFromReactiveObject: 'data-from-reactive-object',
      dataFromWatchOnReactiveObject: 'data-from-reactive-object',
      dataFromWatchOnReactiveString: 'data-from-reactive-string',
    })
  })

  it('should handle events emitted from immediate watches', async () => {
    const component = await mountSuspended(ScriptSetupWatch)
    await expect.poll(() => component.emitted()).toEqual({
      'event-from-watch-effect-on-computed-from-reactive-object': [[1]],
      'event-from-watch-effect-on-reactive-object': [[1]],
      'event-from-watch-effect-on-reactive-string': [[1]],
      'event-from-watch-on-computed-from-reactive-object': [[1]],
      'event-from-watch-on-reactive-object': [[1]],
      'event-from-watch-on-reactive-string': [[1]],
    })
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

    it('should handle computed defined as functions and as objects', async () => {
      const component = await mountSuspended(OptionsApiComputed)
      expect(component.find('[data-testid="simple-function"]').text()).toBe('simple-function')
      expect(component.find('[data-testid="object-with-get"]').text()).toBe('object-with-get')
      expect(component.find('[data-testid="object-with-get-and-set"]').text()).toBe('object-with-get-and-set')
      expect(console.error).not.toHaveBeenCalled()
    })
  })
})

describe.each(Object.entries(formats))(`%s`, (name, component) => {
  let wrapper: VueWrapper<InstanceType<typeof component>>

  beforeEach(async () => {
    wrapper = await mountSuspended(component, {
      props: {
        myProp: 'Hello nuxt-vitest',
        myArrayProp: ['hello', 'nuxt', 'vitest'],
        myObjProp: { title: 'Hello nuxt/test-utils' },
      },
    })
  })

  it('mounts with props', () => {
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span><span>myObjProp: {"title":"Hello nuxt/test-utils"}</span>
</div>
    `.trim())

    expect(wrapper.props()).toEqual({
      myProp: 'Hello nuxt-vitest',
      myArrayProp: ['hello', 'nuxt', 'vitest'],
      myObjProp: { title: 'Hello nuxt/test-utils' },
    })

    expect(wrapper.props('myProp')).toBe('Hello nuxt-vitest')
  })

  it('can be updated with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span><span>myObjProp: {"title":"Hello nuxt/test-utils"}</span>
</div>
    `.trim())

    expect(wrapper.props()).toEqual({
      myProp: 'updated title',
      myArrayProp: ['hello', 'nuxt', 'vitest'],
      myObjProp: { title: 'Hello nuxt/test-utils' },
    })
  })

  it('can be updated array with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
      myArrayProp: ['updated', 'prop'],
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>updated</span><span>prop</span><span>myObjProp: {"title":"Hello nuxt/test-utils"}</span>
</div>
    `.trim())
  })

  it('can be updated object with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
      myObjProp: {},
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span><span>myObjProp: {}</span>
</div>
    `.trim())
  })

  it('can be updated to null with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
      myObjProp: null,
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span><span>myObjProp: null</span>
</div>
    `.trim())
  })

  it('can be updated to undefined with setProps', async () => {
    await wrapper.setProps({
      myProp: 'updated title',
      myObjProp: undefined,
    })
    expect(wrapper.html()).toEqual(`
<div>
  <h1>${name}</h1><pre>updated title</pre><pre>XHello nuxt-vitest</pre><span>hello</span><span>nuxt</span><span>vitest</span><span>myObjProp: {}</span>
</div>
    `.trim())
  })
})

it('renders links correctly', async () => {
  const component = await mountSuspended(LinkTests)

  expect(component.html()).toMatchInlineSnapshot(`"<div><a href="/test"> Link with string to prop </a><a href="/test"> Link with object to prop </a></div>"`)
})

it('element should be changed', async () => {
  const component = await mountSuspended(WrapperElement, { props: { as: 'div' } })

  expect(component.element.tagName).toBe('DIV')

  await component.setProps({ as: 'span' })

  expect(component.element.tagName).toBe('SPAN')
})
