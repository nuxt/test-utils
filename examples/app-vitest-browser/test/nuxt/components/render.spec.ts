import { describe, it, expect, vi } from 'vitest'
import { render } from '@nuxt/test-utils/vitest-browser-nuxt'
import { MyCounter } from '#components'

describe('Render Component', () => {
  it('renders', async () => {
    const { getByText } = await render(MyCounter)
    expect(getByText('Count: 0')).toBeInTheDocument()
  })

  it('can be interacted with (increment)', async () => {
    const { getByText } = await render(MyCounter)
    const incrementButton = getByText('Increment')
    await incrementButton.click()
    expect(getByText('Count: 1')).toBeInTheDocument()
  })

  it('can be interacted with (decrement)', async () => {
    const { getByText } = await render(MyCounter)
    const decrementButton = getByText('Decrement')
    await decrementButton.click()
    expect(getByText('Count: -1')).toBeInTheDocument()
  })

  it('can use Nuxt-specific composables', async () => {
    const { getByText } = await render(MyCounter)
    const config = getByText('Runtime Config:')
    expect(config).toBeInTheDocument()
    expect(config).toHaveTextContent(/"buildAssetsDir"\s*:\s*"\/_nuxt\/"/)
  })

  it('rerender', async () => {
    const screen = await render(defineComponent({
      props: {
        name: {
          type: String,
          default: 'Unknown',
        },
      },
      setup(props) {
        return () => h('h1', {}, `Hello ${props.name}!`)
      },
    }))

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Unknown!')

    await screen.rerender({ name: 'Nuxt' })

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Nuxt!')
  })

  it('locator', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    expect(screen.locator.getByRole('heading')).toHaveTextContent('Hello Nuxt!')
  })

  it('baseElement(default)', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Nuxt!')

    expect(screen.baseElement).toHaveTextContent('Hello Nuxt!')
  })

  it('baseElement(document.body)', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }), { baseElement: document.body })

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Nuxt!')

    expect(screen.baseElement).toBe(document.body)
    expect(screen.baseElement).toContainElement(screen.container)
    expect(screen.baseElement).toHaveTextContent('Hello Nuxt!')

    expect(screen.container).toHaveTextContent('Hello Nuxt!')

    await screen.unmount()

    expect(screen.baseElement).toContainElement(screen.container)
  })

  it('baseElement(custom element)', async ({ onTestFinished }) => {
    const baseElement = document.body.appendChild(document.createElement('div'))
    onTestFinished(() => baseElement.remove())

    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }), { baseElement })

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Nuxt!')

    expect(screen.baseElement).toBe(baseElement)
    expect(screen.baseElement).toContainElement(screen.container)
    expect(screen.baseElement).toHaveTextContent('Hello Nuxt!')

    expect(screen.container).toHaveTextContent('Hello Nuxt!')

    await screen.unmount()

    expect(screen.baseElement).not.toContainElement(screen.container)
  })

  it('container(default)', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Nuxt!')

    expect(screen.baseElement).toBe(document.body)
    expect(screen.baseElement).toContainElement(screen.container)
    expect(screen.baseElement).toHaveTextContent('Hello Nuxt!')

    expect(screen.container).toHaveTextContent('Hello Nuxt!')
    expect(screen.container).toHaveAttribute('id', 'nuxt-test')

    await screen.unmount()

    expect(screen.baseElement).toContainElement(screen.container)
  })

  it('container(custom element)', async ({ onTestFinished }) => {
    const container = document.body.appendChild(document.createElement('div'))
    onTestFinished(() => container.remove())

    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }), { container })

    expect(screen.getByRole('heading')).toHaveTextContent('Hello Nuxt!')

    expect(screen.baseElement).toBe(document.body)
    expect(screen.baseElement).toContainElement(screen.container)
    expect(screen.baseElement).toHaveTextContent('Hello Nuxt!')

    expect(screen.container).toBe(container)
    expect(screen.container).toHaveTextContent('Hello Nuxt!')

    await screen.unmount()

    expect(screen.baseElement).toContainElement(screen.container)
  })

  it('umount', async () => {
    const onBeforeUnmountFn = vi.fn()
    const screen = await render(defineComponent({
      setup() {
        onBeforeUnmount(onBeforeUnmountFn)
      },
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    await screen.unmount()

    expect(screen.container).toHaveAttribute('id', 'nuxt-test')
    expect(screen.container).toBeEmptyDOMElement()

    expect(onBeforeUnmountFn).toHaveBeenCalledOnce()
  })
})
