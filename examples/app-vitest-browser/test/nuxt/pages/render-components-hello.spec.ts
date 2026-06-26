import { describe, it, expect, afterAll } from 'vitest'
import { page } from 'vitest/browser'
import { registerEndpoint } from '@nuxt/test-utils/runtime'

import App from '~/app.vue'

const cleanups = [
  registerEndpoint(
    '/api/hello',
    await import('#server/api/hello.get').then(r => r.default),
  ),
]

describe('Render Page (/components/hello)', () => {
  afterAll(() => cleanups.forEach(fn => fn()))

  it('can display title from runtimeConfig', async () => {
    const screen = await page.render(App, { route: '/components/hello' })

    const header = screen.getByRole('banner')
    await expect.element(header).toBeInTheDocument()

    const title = header.getByRole('heading')
    await expect.element(title).toBeInTheDocument()
    await expect.element(title).toHaveTextContent('Vitest Browser Mode')
  })

  it('can display title from route.meta', async () => {
    const screen = await page.render(App, { route: '/components/hello' })

    const main = screen.getByRole('main')
    await expect.element(main).toBeInTheDocument()

    const title = main.getByRole('heading')
    await expect.element(title).toBeInTheDocument()
    await expect.element(title).toHaveTextContent('Hello')
  })

  it('can render with fetch result', async () => {
    const screen = await page.render(App, {
      route: {
        path: '/components/hello',
        query: {
          name: 'Nuxt App',
        },
      },
    })

    const main = screen.getByRole('main')
    await expect.element(main).toBeInTheDocument()

    const message = main.getByRole('textbox', { name: 'Message' })
    await expect.element(message).toBeInTheDocument()
    await expect.element(message).toHaveValue('Hello Nuxt App!')
  })
})
