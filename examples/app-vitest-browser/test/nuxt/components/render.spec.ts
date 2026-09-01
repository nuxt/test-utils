import { describe, it, expect, vi } from 'vitest'
import { render } from '@nuxt/test-utils/browser'
import { CustomRandom, MyCounter } from '#components'

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

  it('can spy component setup state via setupState', async () => {
    const screen = await render(CustomRandom, { spy: true })

    vi.mocked(screen.setupState.getRandom).mockImplementation(() => 200)

    await screen.getByRole('button', { name: 'Random', exact: true }).click()

    expect(screen.setupState.getRandom).toHaveBeenCalled()
    expect(screen.setupState.random).toHaveBeenCalledWith(200)
    expect(screen.setupState.input.value).toBe(400)
  })

  it('exposes an empty setupState for components without setup', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    expect(screen.setupState).toEqual({})
  })

  it('keeps earlier renders reactive', async () => {
    const Watcher = defineComponent({
      setup() {
        const count = ref(0)
        const seen = ref<number[]>([])
        watch(count, value => seen.value.push(value))
        return () => h('div', {}, [
          h('button', { onClick: () => count.value++ }, 'Increment'),
          h('span', {}, `Seen: ${seen.value.join(',')}`),
        ])
      },
    })

    const first = await render(Watcher, { scoped: true })
    await render(Watcher, { scoped: true })

    await first.getByText('Increment').click()

    await expect.element(first.getByText(/^Seen:/)).toHaveTextContent('Seen: 1')
  })

  it('gives each render its own container', async () => {
    const first = await render(MyCounter)
    const second = await render(MyCounter)

    expect(first.container).not.toBe(second.container)

    await first.getByText('Increment').click()

    expect(first.getByText('Count: 1')).toBeInTheDocument()
    expect(second.getByText('Count: 0')).toBeInTheDocument()
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

    expect(screen.baseElement).not.toContainElement(screen.container)
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

    await screen.unmount()

    expect(screen.baseElement).not.toContainElement(screen.container)
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

    expect(screen.container).toBeEmptyDOMElement()
    expect(document.body).not.toContainElement(screen.container)

    expect(onBeforeUnmountFn).toHaveBeenCalledOnce()
  })
})
