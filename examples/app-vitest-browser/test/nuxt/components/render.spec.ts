import { describe, it, expect } from 'vitest'
import { render } from '@nuxt/test-utils/vitest-browser-nuxt'
import { MyCounter } from '#components'

describe('Render Component (MyCounter)', () => {
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
})
