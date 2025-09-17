import { describe, expect, it } from 'vitest'

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'

import { listen } from 'listhen'
import { createApp, eventHandler, toNodeListener, readBody, getHeaders, getQuery } from 'h3'

import FetchComponent from '~/components/FetchComponent.vue'

describe('server mocks and data fetching', () => {
  it('can use $fetch', async () => {
    const app = createApp().use(
      '/todos/1',
      eventHandler(() => ({ id: 1 })),
    )
    const server = await listen(toNodeListener(app))
    const urls = await server.getURLs()
    const { url } = urls[0]!
    expect(await $fetch<unknown>('/todos/1', { baseURL: url })).toMatchObject({
      id: 1,
    })
    await server.close()
  })

  it('can mock fetch requests within components', async () => {
    registerEndpoint('https://jsonplaceholder.typicode.com/todos/1', () => ({
      title: 'title from mocked api',
    }))
    const component = await mountSuspended(FetchComponent)
    expect(component.html()).toMatchInlineSnapshot(
      '"<div>title from mocked api</div>"',
    )
  })

  it('can mock fetch requests made directly', async () => {
    registerEndpoint('/with-query', () => ({
      title: 'mocked',
    }))
    expect(
      await $fetch<unknown>('/with-query', { query: { test: true } }),
    ).toMatchObject({
      title: 'mocked',
    })
  })

  it('can override and remove request mocks', async () => {
    const unsubFirst = registerEndpoint('/overrides', () => ({ title: 'first' }))
    expect(await $fetch<unknown>('/overrides')).toStrictEqual({ title: 'first' })

    const unsubSecond = registerEndpoint('/overrides', () => ({ title: 'second' }))
    expect(await $fetch<unknown>('/overrides')).toStrictEqual({ title: 'second' })

    unsubSecond()
    expect(await $fetch<unknown>('/overrides')).toStrictEqual({ title: 'first' })

    unsubFirst()
    await expect($fetch<unknown>('/overrides')).rejects.toMatchInlineSnapshot(`[FetchError: [GET] "/overrides": 404 Cannot find any path matching /overrides.]`)
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

  it('can mock native fetch requests', async () => {
    registerEndpoint('/native/1', {
      method: 'POST',
      handler: () => ({ path: '/native/1', method: 'POST' }),
    })
    registerEndpoint('/native/1', {
      method: 'GET',
      handler: () => ({ path: '/native/1', method: 'GET' }),
    })
    registerEndpoint('https://jsonplaceholder.typicode.com/native/1', {
      method: 'GET',
      handler: () => ({ path: 'https://jsonplaceholder.typicode.com/native/1', method: 'GET' }),
    })
    registerEndpoint('https://jsonplaceholder.typicode.com/native/1', {
      method: 'POST',
      handler: () => ({ path: 'https://jsonplaceholder.typicode.com/native/1', method: 'POST' }),
    })

    expect(await fetch('/native/1').then(res => res.json())).toMatchObject({ path: '/native/1', method: 'GET' })
    expect(await fetch('/native/1', { method: 'POST' }).then(res => res.json())).toMatchObject({ path: '/native/1', method: 'POST' })
    expect(await fetch('https://jsonplaceholder.typicode.com/native/1').then(res => res.json()))
      .toMatchObject({ path: 'https://jsonplaceholder.typicode.com/native/1', method: 'GET' })
    expect(await fetch('https://jsonplaceholder.typicode.com/native/1', { method: 'POST' }).then(res => res.json()))
      .toMatchObject({ path: 'https://jsonplaceholder.typicode.com/native/1', method: 'POST' })
  })

  it('can mock fetch requests with data', async () => {
    registerEndpoint('/with-data', {
      method: 'POST',
      handler: async (event) => {
        return {
          body: await readBody(event),
          headers: getHeaders(event),
        }
      },
    })

    expect(await $fetch<unknown>('/with-data', {
      method: 'POST',
      body: { data: 'data' },
      headers: { 'x-test': 'test' },
    })).toMatchObject({
      body: { data: 'data' },
      headers: { 'x-test': 'test' },
    })

    expect(await fetch('/with-data', {
      method: 'POST',
      body: JSON.stringify({ data: 'data' }),
      headers: { 'x-test': 'test', 'content-type': 'application/json' },
    }).then(res => res.json())).toMatchObject({
      body: { data: 'data' },
      headers: { 'x-test': 'test' },
    })
  })

  it('can mock fetch requests with query', async () => {
    registerEndpoint('/with-data', {
      method: 'GET',
      handler: async (event) => {
        return {
          query: getQuery(event),
        }
      },
    })

    expect(await $fetch<unknown>('/with-data', { query: { q: 1 } })).toMatchObject({ query: { q: '1' } })
    expect(await fetch('/with-data?q=1').then(res => res.json())).toMatchObject({ query: { q: '1' } })
  })

  it('can mock fetch requests with Request', async () => {
    registerEndpoint('http://localhost:3000/with-request', {
      method: 'GET',
      handler: (event) => {
        return { title: 'with-request', data: getQuery(event) }
      },
    })
    registerEndpoint('http://localhost:3000/with-request', {
      method: 'POST',
      handler: async (event) => {
        return { title: 'with-request', data: await readBody(event) }
      },
    })

    const request = new Request('/with-request?q=1', { headers: { 'content-type': 'application/json' } })

    expect(await $fetch<unknown>(request)).toMatchObject({ title: 'with-request', data: { q: '1' } })
    expect(await fetch(request).then(res => res.json())).toMatchObject({ title: 'with-request', data: { q: '1' } })

    expect(await $fetch<unknown>(request, { method: 'POST', body: [1] })).toMatchObject({ title: 'with-request', data: [1] })
    expect(await fetch(request, { method: 'POST', body: '[1]' }).then(res => res.json())).toMatchObject({ title: 'with-request', data: [1] })
  })

  it('can mock fetch requests with URL', async () => {
    registerEndpoint('http://localhost:3000/with-url', {
      method: 'GET',
      handler: (event) => {
        return { title: 'with-url', data: getQuery(event) }
      },
    })

    expect(await fetch(new URL('http://localhost:3000/with-url')).then(res => res.json())).toMatchObject({ title: 'with-url', data: {} })
    expect(await fetch(new URL('http://localhost:3000/with-url?q=1')).then(res => res.json())).toMatchObject({ title: 'with-url', data: { q: '1' } })
  })
})
