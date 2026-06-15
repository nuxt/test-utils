import { describe, it, expect } from 'vitest'
import { page } from 'vitest/browser'

import App from '~/app.vue'

describe('Render Page (/)', () => {
  it('can display title from runtimeConfig', async () => {
    const screen = await page.render(App, { route: '/' })

    const header = screen.getByRole('banner')
    await expect.element(header).toBeInTheDocument()

    const title = header.getByRole('heading')
    await expect.element(title).toBeInTheDocument()
    await expect.element(title).toHaveTextContent('Vitest Browser Mode')
  })

  it('can display title from route.meta', async () => {
    const screen = await page.render(App, { route: '/' })

    const main = screen.getByRole('main')
    await expect.element(main).toBeInTheDocument()

    const title = main.getByRole('heading')
    await expect.element(title).toBeInTheDocument()
    await expect.element(title).toHaveTextContent('Index')
  })

  it('can navigate via a link click', async () => {
    const screen = await page.render(App, { route: '/' })

    const main = screen.getByRole('main')
    await expect.element(main).toBeInTheDocument()

    const title = main.getByRole('heading')
    await expect.element(title).toBeInTheDocument()
    await expect.element(title).toHaveTextContent('Index')

    const link = main.getByRole('link', { name: 'Components' })
    await expect.element(link).toBeInTheDocument()
    await link.click()

    await expect.element(title).toHaveTextContent('Components')
  })
})
