import { it, expect } from 'vitest'
import { render } from '@nuxt/test-utils/browser'

import { Message } from '#components'

it('should render', async () => {
  const screen = await render(Message)
  const message = screen.getByRole('heading')
  await expect.element(message).toMatchTextContent(/Hello Nuxt/)
})
