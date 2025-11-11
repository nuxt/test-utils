import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { renderSuspended } from '@nuxt/test-utils/runtime'
import { cleanup, fireEvent, screen, render } from '@testing-library/vue'

import App from '~/app.vue'
import OptionsComponent from '~/components/OptionsComponent.vue'
import WrapperTests from '~/components/WrapperTests.vue'
import LinkTests from '~/components/LinkTests.vue'
import DirectiveComponent from '~/components/DirectiveComponent.vue'

import ExportDefaultComponent from '~/components/ExportDefaultComponent.vue'
import ExportDefineComponent from '~/components/ExportDefineComponent.vue'
import ComponentWithAttrs from '~/components/ComponentWithAttrs.vue'
import ComponentWithCssVar from '~/components/ComponentWithCssVar.vue'
import ComponentWithPluginProvidedValue from '~/components/ComponentWithPluginProvidedValue.vue'
import ExportDefaultWithRenderComponent from '~/components/ExportDefaultWithRenderComponent.vue'
import ExportDefaultReturnsRenderComponent from '~/components/ExportDefaultReturnsRenderComponent.vue'
import OptionsApiPage from '~/pages/other/options-api.vue'

import CompostionApi from '~/components/TestComponentWithCompostionApi.vue'
import OptionsApiWithData from '~/components/TestComponentWithOptionsApiWithData.vue'
import OptionsApiWithSetup from '~/components/TestComponentWithOptionsApiWithSetup.vue'

import { BoundAttrs, OptionsApiComputed, OptionsApiEmits, OptionsApiWatch, ScriptSetupEmits, ScriptSetupWatch } from '#components'

const formats = {
  ExportDefaultComponent,
  ExportDefineComponent,
  ExportDefaultWithRenderComponent,
  ExportDefaultReturnsRenderComponent,
}

describe('renderSuspended', () => {
  afterEach(() => {
    // since we're not running with Vitest globals when running the tests
    // from inside the test server. This means testing-library cannot
    // auto-attach the cleanup go testing globals, and we have to do
    // it here manually.
    if (process.env.NUXT_VITEST_DEV_TEST) {
      cleanup()
    }
  })

  it('can render components within nuxt suspense', async () => {
    const { html } = await renderSuspended(App)
    expect(html()).toMatchInlineSnapshot(`
      "<div id="test-wrapper">
        <div>This is an auto-imported component</div>
        <div> I am a global component </div>
        <div>Index page</div><a href="/test"> Test link </a>
      </div>"
    `)
  })

  it('should handle passing setup state and props to template', async () => {
    const wrappedComponent = await renderSuspended(BoundAttrs)
    const component = render(BoundAttrs)

    expect(`<div id="test-wrapper">${component.html()}</div>`).toEqual(wrappedComponent.html())
  })

  it('should render default props within nuxt suspense', async () => {
    await renderSuspended(OptionsComponent)
    expect(screen.getByRole('heading', { level: 2 })).toMatchInlineSnapshot(
      `
      <h2>
        The original
      </h2>
    `,
    )
  })

  it('should render passed props within nuxt suspense', async () => {
    await renderSuspended(OptionsComponent, {
      props: {
        title: 'title from render suspense props',
      },
    })
    expect(screen.getByRole('heading', { level: 2 })).toMatchInlineSnapshot(
      `
      <h2>
        title from render suspense props
      </h2>
    `,
    )
  })

  it('respects directives registered in nuxt plugins', async () => {
    const component = await renderSuspended(DirectiveComponent)
    expect(component.html()).toMatchInlineSnapshot(`
      "<div id="test-wrapper">
        <div data-directive="true"></div>
      </div>"
    `)
  })

  it('can pass slots to rendered components within nuxt suspense', async () => {
    const text = 'slot from render suspense'
    await renderSuspended(OptionsComponent, {
      slots: {
        default: () => text,
      },
    })
    expect(screen.getByText(text)).toBeDefined()
  })

  it('can receive emitted events from components rendered within nuxt suspense', async () => {
    const onCustomEvent = vi.fn()
    const { emitted } = await renderSuspended(WrapperTests, {
      props: { onCustomEvent },
    })
    const button = screen.getByRole('button', { name: 'Click me!' })
    await fireEvent.click(button)

    const emittedEvents = emitted()
    expect(emittedEvents.click).toMatchObject(
      expect.arrayContaining([
        expect.arrayContaining([expect.objectContaining({ type: 'click' })]),
      ]),
    )

    // since this is a native event it doesn't serialize well
    delete emittedEvents.click
    expect(emittedEvents).toMatchInlineSnapshot(`
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
    expect(onCustomEvent).toBeCalledTimes(1)
    expect(onCustomEvent).toBeCalledWith('foo')
  })

  it('can receive emitted events from components rendered within nuxt suspense using defineModel', async () => {
    const onUpdateModelValue = vi.fn()
    const { emitted } = await renderSuspended(WrapperTests, {
      props: { 'onUpdate:modelValue': onUpdateModelValue },
    })
    const button = screen.getByRole('button', { name: 'Change model!' })
    await fireEvent.click(button)

    const emittedEvents = emitted()
    expect(emittedEvents['update:modelValue']).toEqual([[true]])
    expect(onUpdateModelValue).toBeCalledTimes(1)
    expect(onUpdateModelValue).toBeCalledWith(true)
  })

  it('should define $attrs', async () => {
    const { html } = await renderSuspended(ComponentWithAttrs, { attrs: { foo: 'bar' } })
    expect(html()).toMatchInlineSnapshot(`
      "<div id="test-wrapper"><span foo="bar"></span></div>"
    `)
  })

  it('should capture emits from script setup and early hooks', async () => {
    const onEventFromSetup = vi.fn()
    const onEventBeforeMount = vi.fn()
    const onEventFromMounted = vi.fn()
    const { emitted } = await renderSuspended(ScriptSetupEmits, {
      props: {
        'onEvent-from-setup': onEventFromSetup,
        'onEvent-from-before-mount': onEventBeforeMount,
        'onEvent-from-mounted': onEventFromMounted,
      },
    })
    await expect.poll(() => emitted()).toEqual({
      'event-from-setup': [[1], [2]],
      'event-from-before-mount': [[1], [2]],
      'event-from-mounted': [[1], [2]],
    })
    expect(onEventFromSetup.mock.calls).toEqual([[1], [2]])
    expect(onEventBeforeMount.mock.calls).toEqual([[1], [2]])
    expect(onEventFromMounted.mock.calls).toEqual([[1], [2]])
  })

  it('should handle data set from immediate watches', async () => {
    const { getByTestId } = await renderSuspended(ScriptSetupWatch)
    await expect.poll(
      () =>
        JSON.parse(getByTestId('set-by-watches').textContent || '{}'),
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
    const { emitted } = await renderSuspended(ScriptSetupWatch)
    await expect.poll(() => emitted()).toEqual({
      'event-from-watch-effect-on-computed-from-reactive-object': [[1]],
      'event-from-watch-effect-on-reactive-object': [[1]],
      'event-from-watch-effect-on-reactive-string': [[1]],
      'event-from-watch-on-computed-from-reactive-object': [[1]],
      'event-from-watch-on-reactive-object': [[1]],
      'event-from-watch-on-reactive-string': [[1]],
    })
  })

  it('can render components with use css modules', async () => {
    const { container, html } = await renderSuspended(ComponentWithCssVar)
    expect(html()).toContain('Css Module')
    expect(container.querySelector('#s1')?.classList).toHaveLength(1)
    expect(container.querySelector('#s2')?.classList).toHaveLength(1)
    expect(container.querySelector('#s3')?.classList).toHaveLength(0)
  })

  it('can render components with use plugin provided value in template', async () => {
    const { container } = await renderSuspended(ComponentWithPluginProvidedValue)
    expect(container.querySelector('#s1')?.textContent).toBe('pluginProvided.value')
    expect(container.querySelector('#s2')?.textContent).toBe('pluginProvided.func(value)')
    expect(container.querySelector('#s3')?.textContent).toBe('pluginProvided.object.value')
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
      const { getByTestId } = await renderSuspended(OptionsApiPage)
      expect(getByTestId('greeting-in-setup').textContent).toBe('Hello, setup')
      expect(getByTestId('greeting-in-data1').textContent).toBe('Hello, data1')
      expect(getByTestId('greeting-in-data2').textContent).toBe('Hello, overwritten by asyncData')
      expect(getByTestId('greeting-in-data3').textContent).toBe('Hello, world')
      expect(getByTestId('greeting-in-data4').textContent).toBe('Hello, default')
      expect(getByTestId('greeting-in-computed').textContent).toBe('Hello, computed property')
      expect(getByTestId('computed-data1').textContent).toBe('Hello, data1')
      expect(getByTestId('computed-data2').textContent).toBe('Hello')
      expect(getByTestId('computed-with-methods').textContent).toBe('Hello, method')
      expect(getByTestId('computed-with-config').textContent).toBe('Hello, world')
      expect(getByTestId('computed-with-setup-ref').textContent).toBe('Hello')
      expect(getByTestId('greeting-in-methods').textContent).toBe('Hello, method')
      expect(getByTestId('return-data1').textContent).toBe('Hello, data1')
      expect(getByTestId('return-computed-data1').textContent).toBe('Hello, data1')
      expect(getByTestId('return-computed-data2').textContent).toBe('Hello')
      expect(getByTestId('return-config-data').textContent).toBe('Hello, world')
      expect(getByTestId('return-ref-in-setup-data').textContent).toBe('Hello')
      expect(getByTestId('return-props-data').textContent).toBe('Hello')
    })

    it('should not output error when button in page is clicked', async () => {
      const { getByTestId } = await renderSuspended(OptionsApiPage)
      await fireEvent.click(getByTestId('button-in-page'))
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should not output error when button in component is clicked', async () => {
      const { getByTestId } = await renderSuspended(OptionsApiPage)
      await fireEvent.click(getByTestId('test-button'))
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should handle computed defined as functions and as objects', async () => {
      const { getByTestId } = await renderSuspended(OptionsApiComputed)
      expect(getByTestId('simple-function').textContent).toBe('simple-function')
      expect(getByTestId('object-with-get').textContent).toBe('object-with-get')
      expect(getByTestId('object-with-get-and-set').textContent).toBe('object-with-get-and-set')
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should handle computed defined with setter can set value', async () => {
      const { getByTestId } = await renderSuspended(OptionsApiComputed)
      await fireEvent.click(getByTestId('hanlde-change-object-with-get-and-set'))
      expect(getByTestId('object-with-get-and-set').textContent).toBe('object-with-get-and-set (changed)')
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should capture emits from setup and early hooks', async () => {
      const onEventFromSetup = vi.fn()
      const onEventBeforeMount = vi.fn()
      const onEventFromMounted = vi.fn()
      const { emitted } = await renderSuspended(OptionsApiEmits, {
        props: {
          'onEvent-from-setup': onEventFromSetup,
          'onEvent-from-before-mount': onEventBeforeMount,
          'onEvent-from-mounted': onEventFromMounted,
        },
      })
      await expect.poll(() => emitted()).toEqual({
        'event-from-setup': [[1], [2]],
        'event-from-before-mount': [[1], [2]],
        'event-from-mounted': [[1], [2]],
      })
      expect(console.error).not.toHaveBeenCalled()
      expect(onEventFromSetup.mock.calls).toEqual([[1], [2]])
      expect(onEventBeforeMount.mock.calls).toEqual([[1], [2]])
      expect(onEventFromMounted.mock.calls).toEqual([[1], [2]])
    })

    it('should handle data set from immediate watches', async () => {
      const { getByTestId } = await renderSuspended(OptionsApiWatch)
      await expect.poll(
        () =>
          JSON.parse(getByTestId('set-by-watches').textContent || '{}'),
      ).toEqual({
        dataFromInternalDataObject: 'data-from-internal-data-object',
        dataMappedFromExternalReactiveStore: 'data-from-external-reactive-store',
      })
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should handle events emitted from immediate watches', async () => {
      const onEventfromInternalDataObject = vi.fn()
      const onEventMappedFromExternalReactiveStore = vi.fn()
      const { emitted } = await renderSuspended(OptionsApiWatch, {
        props: {
          'onEvent-from-internal-data-object': onEventfromInternalDataObject,
          'onEvent-mapped-from-external-reactive-store': onEventMappedFromExternalReactiveStore,
        },
      })
      await expect.poll(() => emitted()).toEqual({
        'event-from-internal-data-object': [[1]],
        'event-mapped-from-external-reactive-store': [[1]],
      })
      expect(console.error).not.toHaveBeenCalled()
      expect(onEventfromInternalDataObject.mock.calls).toEqual([[1]])
      expect(onEventMappedFromExternalReactiveStore.mock.calls).toEqual([[1]])
    })
  })
})

describe.each(Object.entries(formats))(`%s`, (name, component) => {
  it('mounts with props', async () => {
    const wrapper = await renderSuspended(component, {
      props: {
        myProp: 'Hello nuxt-vitest',
        myObjProp: { title: 'Hello nuxt/test-utils' },
      },
    })

    expect(wrapper.html()).toEqual(`
<div id="test-wrapper">
  <div>
    <h1>${name}</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre><span>myObjProp: {"title":"Hello nuxt/test-utils"}</span>
  </div>
</div>
    `.trim())
  })

  it('rerender props', async () => {
    const wrapper = await renderSuspended(component, {
      props: {
        myProp: 'init',
      },
    })

    await wrapper.rerender({ myProp: 'change' })

    expect(wrapper.html()).toEqual(`
<div id="test-wrapper">
  <div>
    <h1>${name}</h1><pre>change</pre><pre>Xinit</pre><span>myObjProp: {}</span>
  </div>
</div>
    `.trim())
  })
})

describe.each([
  { Component: CompostionApi, type: 'CompostionApi', description: '<script setup>' } as const,
  { Component: OptionsApiWithData, type: 'OptionsApi', description: '<script> defineComponent with data' } as const,
  { Component: OptionsApiWithSetup, type: 'OptionsApi', description: '<script> defineComponent with setup' } as const,
])('$description', ({ Component }) => {
  it('rerender with v-show', async () => {
    const wrapper = await renderSuspended(Component, { props: { show: false } })
    const container = await wrapper.findByTestId('container')
    expect(container.style.display).toBe('none')
    await wrapper.rerender({ show: true })
    expect(container.style.display).toBe('')
  })
})

it('renders links correctly', async () => {
  const component = await renderSuspended(LinkTests)

  expect(component.html()).toMatchInlineSnapshot(`
    "<div id="test-wrapper">
      <div><a href="/test"> Link with string to prop </a><a href="/test"> Link with object to prop </a></div>
    </div>"
  `)
})
