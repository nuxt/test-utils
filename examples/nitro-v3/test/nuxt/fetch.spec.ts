import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { it, expect, describe, vi } from 'vitest'

import { readBody, getQuery } from 'h3-next'
import type { H3Event } from 'h3-next'

function getHeaders(event: H3Event) {
  return Object.fromEntries(event.req.headers.entries())
}

describe('registerEndpoint tests', () => {
  it('works with h3 v2 syntax', async () => {
    registerEndpoint('/test1/', event => new Response(event.req.headers.get('x-custom-header') || ''))

    const fetchOptions = {
      headers: { 'x-custom-header': 'my-value' },
    }

    expect(await $fetch('/test1/', fetchOptions)).toBe('my-value')
    expect(await fetch('/test1/', fetchOptions).then(r => r.text())).toBe('my-value')
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
    await expect($fetch<unknown>('/overrides')).rejects.toMatchObject({ status: 404 })
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

  it('can mock fetch requests with url including query param', async () => {
    registerEndpoint('/with-url-including-query-param/1?q=1', () => 'ok')

    expect(await $fetch<unknown>('/with-url-including-query-param/1?q=1')).toBe('ok')
    expect(await fetch('/with-url-including-query-param/1?q=1').then(res => res.text())).toBe('ok')
  })

  it('fails when query params do not match', async () => {
    registerEndpoint('/with-url-including-query-param/2?q=2', () => 'ok')

    await expect($fetch<unknown>('/with-url-including-query-param/2?q=3')).rejects.toMatchObject({ status: 404 })
    expect(await fetch('/with-url-including-query-param/2?q=3').then(r => r.status)).toBe(404)
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

  it('can mock fetch requests with fetch.create', async () => {
    registerEndpoint('/fetch-create/1', event => ({
      title: 'title from mocked api1',
      headers: getHeaders(event),
    }))
    registerEndpoint('/fetch-create/2', event => ({
      title: 'title from mocked api2',
      headers: getHeaders(event),
    }))
    registerEndpoint('/fetch-create/error', () =>
      new Response(undefined, { status: 500, statusText: 'Mock Server Error' }),
    )

    const onRequest = vi.fn()
    const onResponse = vi.fn()
    const onRequestError = vi.fn()
    const onResponseError = vi.fn()

    const fetch = $fetch.create({
      baseURL: '/fetch-create',
      retry: false,
      onRequest,
      onResponse,
      onRequestError,
      onResponseError,
      headers: {
        authorization: 'Bearer <access_token>',
      },
    })

    expect(await fetch<unknown>('/1')).toMatchObject({
      title: 'title from mocked api1',
      headers: { authorization: 'Bearer <access_token>' },
    })

    expect(await fetch<unknown>('/2')).toMatchObject({
      title: 'title from mocked api2',
      headers: { authorization: 'Bearer <access_token>' },
    })

    await expect(fetch<unknown>('/error')).rejects.toMatchObject({ status: 500, statusText: 'Mock Server Error' })
    await expect(fetch<unknown>('/error', { baseURL: '"INVALID"' })).rejects.toThrowError()

    expect(onRequest).toBeCalledTimes(4)
    expect(onResponse).toBeCalledTimes(3)
    expect(onRequestError).toBeCalledTimes(1)
    expect(onResponseError).toBeCalledTimes(1)
  })

  it('should mock request only once with once option', async () => {
    registerEndpoint('/with-once-options', { handler: () => '1', once: true })
    registerEndpoint('/with-once-options?q=1', { handler: () => '2', once: true })
    registerEndpoint('/with-once-options?q=2', { handler: () => '3', once: true })
    registerEndpoint('/with-once-options?q=2', { handler: () => '4', once: true })
    registerEndpoint('/with-once-options?q=2', { handler: () => '5', once: true })

    expect(await $fetch<unknown>('/with-once-options?q=1')).toBe('1')
    expect(await $fetch<unknown>('/with-once-options?q=1')).toBe('2')
    await expect($fetch<unknown>('/with-once-options?q=1')).rejects.toMatchObject({ status: 404 })
    expect(await $fetch<unknown>('/with-once-options?q=2')).toBe('5')
    expect(await $fetch<unknown>('/with-once-options?q=2')).toBe('4')
    expect(await $fetch<unknown>('/with-once-options?q=2')).toBe('3')
    await expect($fetch<unknown>('/with-once-options?q=2')).rejects.toMatchObject({ status: 404 })
  })

  it('endpoint priority 1', async () => {
    registerEndpoint('/endpoint/priority/1?q=1', { handler: () => '1' })
    registerEndpoint('/endpoint/priority/1', { handler: () => '2' })

    expect(await $fetch<unknown>('/endpoint/priority/1')).toBe('2')
    expect(await $fetch<unknown>('/endpoint/priority/1?q=1')).toBe('1')
    expect(await $fetch<unknown>('/endpoint/priority/1?q=1')).toBe('1')
  })

  it('endpoint priority 2', async () => {
    registerEndpoint('/endpoint/priority/2', { handler: () => '1' })
    registerEndpoint('/endpoint/priority/2?q=1', { handler: () => '2' })

    expect(await $fetch<unknown>('/endpoint/priority/2')).toBe('1')
    expect(await $fetch<unknown>('/endpoint/priority/2?q=1')).toBe('1')
    expect(await $fetch<unknown>('/endpoint/priority/2?q=1')).toBe('1')
  })
})
