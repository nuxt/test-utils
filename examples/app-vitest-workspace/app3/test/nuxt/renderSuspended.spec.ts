import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, cleanup } from '@testing-library/vue'
import { renderSuspended } from '@nuxt/test-utils/runtime'

import App from '~~/app.vue'
import { Counter } from '#components'

describe('renderSuspended', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render page', async () => {
    const wrapper = await renderSuspended(App, {
      route: '/',
    })

    const title = await wrapper.findByRole('heading', { level: 1 })
    expect(title.textContent).toBe('Index')

    const link = wrapper.findByRole('link', { name: 'Counter' })
    expect((await link).getAttribute('href')).toBe('/counter')
  })

  it('should render component', async () => {
    const wrapper = await renderSuspended(Counter)

    const title = await wrapper.findByRole('heading', { level: 2 })
    expect(title.textContent).toBe('Counter Component')

    const input = await wrapper.findByLabelText<HTMLInputElement>('Count')
    expect(input.value).toBe('0')
  })

  it('should handle event', async () => {
    const wrapper = await renderSuspended(Counter)
    const input = await wrapper.findByLabelText<HTMLInputElement>('Count')

    const button = await wrapper.findByRole('button')
    await fireEvent.click(button)

    expect(input.value).toBe('1')
  })

  it('should update props', async () => {
    const wrapper = await renderSuspended(Counter, {
      props: {
        title: 'Title',
      },
    })

    const title = await wrapper.findByRole('heading', { level: 2 })
    expect(title.textContent).toBe('Title')

    await wrapper.rerender({ title: 'Title(Updated)' })
    expect(title.textContent).toBe('Title(Updated)')
  })
})
