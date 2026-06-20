import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { render } from '@nuxt/test-utils/vitest-browser-nuxt'

import { defineComponent, h, onBeforeUnmount } from '#imports'
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
