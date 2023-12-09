import { describe, expect, it } from 'vitest'

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'

import { listen } from 'listhen'
import { createApp, eventHandler, toNodeListener } from 'h3'

import FetchComponent from '~/components/FetchComponent.vue'

describe('server mocks and data fetching', () => {
  it('can use $fetch', async () => {
    const app = createApp().use(
      '/todos/1',
      eventHandler(() => ({ id: 1 }))
    )
    const server = await listen(toNodeListener(app))
    const [{ url }] = await server.getURLs()
    expect(await $fetch<unknown>('/todos/1', { baseURL: url })).toMatchObject({
      id: 1,
    })
    await server.close()
  })

  it('can mock fetch requests', async () => {
    registerEndpoint('https://jsonplaceholder.typicode.com/todos/1', () => ({
      title: 'title from mocked api',
    }))
    const component = await mountSuspended(FetchComponent)
    expect(component.html()).toMatchInlineSnapshot(
      '"<div>title from mocked api</div>"'
    )
  })

  it('can mock fetch requests', async () => {
    registerEndpoint('/with-query', () => ({
      title: 'mocked',
    }))
    expect(
      await $fetch<unknown>('/with-query', { query: { test: true } })
    ).toMatchObject({
      title: 'mocked',
    })
  })

  it('can mock fetch requests with explicit methods', async () => {
    registerEndpoint('/method', {
      method: 'POST',
      handler: () => ({ method: 'POST' }),
    })
    registerEndpoint('/method', {
      method: 'GET',
      handler: () => ({ method: 'GET' }),
    })
    expect(await $fetch<unknown>('/method', { method: 'POST' })).toMatchObject({
      method: 'POST',
    })
    expect(await $fetch<unknown>('/method')).toMatchObject({ method: 'GET' })
  })
})
