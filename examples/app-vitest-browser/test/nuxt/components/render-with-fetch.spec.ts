import { describe, it, expect, afterAll } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { render } from '@nuxt/test-utils/vitest-browser-nuxt'

import { MyHello } from '#components'

const cleanups = [
  registerEndpoint(
    '/api/hello',
    await import('#server/api/hello.get').then(r => r.default),
  ),
]

describe('Render Component (MyHello)', () => {
  afterAll(() => cleanups.forEach(fn => fn()))

  it('renders', async () => {
    const screen = await render(MyHello)
    const message = screen.getByLabelText('Message')
    await expect.element(message).toHaveValue('Hello Unknown!')
  })

  it('can be interacted with input', async () => {
    const screen = await render(MyHello)

    const name = screen.getByLabelText('Name')
    await name.fill('Nuxt')

    const message = screen.getByLabelText('Message')
    await expect.element(message).toHaveValue('Hello Nuxt!')
  })

  it('can be rerender', async () => {
    const screen = await render(MyHello)

    await screen.rerender({ modelValue: 'Nuxt App' })

    const message = screen.getByLabelText('Message')
    await expect.element(message).toHaveValue('Hello Nuxt App!')
  })
})
