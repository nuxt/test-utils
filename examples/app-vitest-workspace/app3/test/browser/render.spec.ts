import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { render } from '@nuxt/test-utils/vitest-browser-nuxt'

import { Counter } from '#components'

import App from '~~/app.vue'

describe('render', () => {
  it('can render', async () => {
    const screen = await render(App, { route: '/' })

    const title = screen.getByRole('heading')
    await expect.element(title).toHaveTextContent('Index')
  })

  it('can render with page', async () => {
    const screen = await page.render(App, { route: '/' })

    const title = screen.getByRole('heading')
    await expect.element(title).toHaveTextContent('Index')
  })

  it('can rerender', async () => {
    const screen = await render(Counter, { props: { title: 'Title' } })

    const title = screen.getByRole('heading')
    await screen.rerender({ title: 'Title(Updated)' })

    await expect.element(title).toHaveTextContent('Title(Updated)')
  })

  it('can rerender with page', async () => {
    const screen = await page.render(Counter, { props: { title: 'Title' } })

    const title = screen.getByRole('heading')
    await screen.rerender({ title: 'Title(Updated)' })

    await expect.element(title).toHaveTextContent('Title(Updated)')
  })
})
