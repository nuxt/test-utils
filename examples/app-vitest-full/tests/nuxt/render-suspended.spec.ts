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
import ExportDefaultWithRenderComponent from '~/components/ExportDefaultWithRenderComponent.vue'
import ExportDefaultReturnsRenderComponent from '~/components/ExportDefaultReturnsRenderComponent.vue'
import OptionsApiPage from '~/pages/other/options-api.vue'

import { BoundAttrs, OptionsApiEmits, OptionsApiWatch, ScriptSetupEmits, ScriptSetupWatch } from '#components'

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
    const { emitted } = await renderSuspended(WrapperTests)
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
  })

  it('should define $attrs', async () => {
    const { html } = await renderSuspended(ComponentWithAttrs, { attrs: { foo: 'bar' } })
    expect(html()).toMatchInlineSnapshot(`
      "<div id="test-wrapper"><span foo="bar"></span></div>"
    `)
  })

  it('should capture emits from script setup and early hooks', async () => {
    const { emitted } = await renderSuspended(ScriptSetupEmits)
    await expect.poll(() => emitted()).toEqual({
      'event-from-setup': [[1], [2]],
      'event-from-before-mount': [[1], [2]],
      'event-from-mounted': [[1], [2]],
    })
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
      expect(getByTestId('greeting-in-computed').textContent).toBe('Hello, computed property')
      expect(getByTestId('computed-data1').textContent).toBe('Hello, data1')
      expect(getByTestId('computed-greeting-in-methods').textContent).toBe('Hello, method')
      expect(getByTestId('greeting-in-methods').textContent).toBe('Hello, method')
      expect(getByTestId('return-data1').textContent).toBe('Hello, data1')
      expect(getByTestId('return-computed-data1').textContent).toBe('Hello, data1')
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

    it('should capture emits from setup and early hooks', async () => {
      const { emitted } = await renderSuspended(OptionsApiEmits)
      await expect.poll(() => emitted()).toEqual({
        'event-from-setup': [[1], [2]],
        'event-from-before-mount': [[1], [2]],
        'event-from-mounted': [[1], [2]],
      })
      expect(console.error).not.toHaveBeenCalled()
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
      const { emitted } = await renderSuspended(OptionsApiWatch)
      await expect.poll(() => emitted()).toEqual({
        'event-from-internal-data-object': [[1]],
        'event-mapped-from-external-reactive-store': [[1]],
      })
      expect(console.error).not.toHaveBeenCalled()
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

it('renders links correctly', async () => {
  const component = await renderSuspended(LinkTests)

  expect(component.html()).toMatchInlineSnapshot(`
    "<div id="test-wrapper">
      <div><a href="/test"> Link with string to prop </a><a href="/test"> Link with object to prop </a></div>
    </div>"
  `)
})
