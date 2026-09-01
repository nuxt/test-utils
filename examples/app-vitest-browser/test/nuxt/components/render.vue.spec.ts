import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-vue'
import { MyCounter } from '#components'

describe('Render(vue) Component', () => {
  it('renders', () => {
    const { getByText } = render(MyCounter)
    expect(getByText('Count: 0')).toBeInTheDocument()
  })

  it('can be interacted with (increment)', async () => {
    const { getByText } = render(MyCounter)
    const incrementButton = getByText('Increment')
    await incrementButton.click()
    expect(getByText('Count: 1')).toBeInTheDocument()
  })

  it('can be interacted with (decrement)', async () => {
    const { getByText } = render(MyCounter)
    const decrementButton = getByText('Decrement')
    await decrementButton.click()
    expect(getByText('Count: -1')).toBeInTheDocument()
  })

  it('can use Nuxt-specific composables', () => {
    const { getByText } = render(MyCounter)
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
})
