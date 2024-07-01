import { afterEach, describe, expect, it } from 'vitest'

import { renderSuspended } from '@nuxt/test-utils/runtime'
import { cleanup, fireEvent, screen, render } from '@testing-library/vue'

import App from '~/app.vue'
import OptionsComponent from '~/components/OptionsComponent.vue'
import WrapperTests from '~/components/WrapperTests.vue'
import LinkTests from '~/components/LinkTests.vue'

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
})

describe.each(Object.entries(formats))(`%s`, (name, component) => {
  it('mounts with props', async () => {
    const wrapper = await renderSuspended(component, {
      props: {
        myProp: 'Hello nuxt-vitest',
      },
    })

    expect(wrapper.html()).toEqual(`
<div id="test-wrapper">
  <div>
    <h1>${name}</h1><pre>Hello nuxt-vitest</pre><pre>XHello nuxt-vitest</pre>
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
  </div>"`)
})
