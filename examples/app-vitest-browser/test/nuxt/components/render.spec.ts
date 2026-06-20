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

  it('locator', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    expect(screen.locator.getByRole('heading')).toHaveTextContent('Hello Nuxt!')
  })

  it('baseElement', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    await expect.element(screen.baseElement).toHaveAttribute('id', 'nuxt-test')
    expect(screen.baseElement.children[0]?.outerHTML).toBe('<h1>Hello Nuxt!</h1>')
  })

  it('container', async () => {
    const screen = await render(defineComponent({
      render: () => h('h1', {}, 'Hello Nuxt!'),
    }))

    await expect.element(screen.container).toHaveAttribute('id', 'nuxt-test')
    expect(screen.container.children[0]?.outerHTML).toBe('<h1>Hello Nuxt!</h1>')
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

    await expect.element(screen.container).toHaveAttribute('id', 'nuxt-test')
    expect(screen.container.children.length).toBe(0)
    expect(onBeforeUnmountFn).toHaveBeenCalledOnce()
  })
})
