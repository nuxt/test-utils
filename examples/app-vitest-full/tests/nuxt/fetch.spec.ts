import { describe, expect, it, vi } from 'vitest'

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'

import { listen } from 'listhen'
import { createApp, eventHandler, toNodeListener, readBody, getHeaders, getQuery, setCookie, readFormData } from 'h3'

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
    expect(await $fetch('/todos/1', { baseURL: url })).toMatchObject({
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
      await $fetch('/with-query', { query: { test: true } }),
    ).toMatchObject({
      title: 'mocked',
    })
  })

  it('can set cookies from mocked endpoints', async () => {
    registerEndpoint('/with-cookies', eventHandler((event) => {
      setCookie(event, 'first', '1')
      setCookie(event, 'second', '2')
      return 'ok'
    }))
    const response = await fetch('/with-cookies')
    expect(response.headers.getSetCookie()).toStrictEqual(['first=1; Path=/', 'second=2; Path=/'])
    expect(await response.text()).toBe('ok')
  })

  it('can override and remove request mocks', async () => {
    const unsubFirst = registerEndpoint('/overrides', () => ({ title: 'first' }))
    expect(await $fetch('/overrides')).toStrictEqual({ title: 'first' })

    const unsubSecond = registerEndpoint('/overrides', () => ({ title: 'second' }))
    expect(await $fetch('/overrides')).toStrictEqual({ title: 'second' })

    unsubSecond()
    expect(await $fetch('/overrides')).toStrictEqual({ title: 'first' })

    unsubFirst()
    await expect($fetch('/overrides')).rejects.toMatchInlineSnapshot(`[FetchError: [GET] "/overrides": 404 Cannot find any path matching /overrides.]`)
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
    expect(await $fetch('/method', { method: 'POST' })).toMatchObject({
      method: 'POST',
    })
    expect(await $fetch('/method')).toMatchObject({ method: 'GET' })
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

    expect(await $fetch('/with-data', {
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

    expect(await $fetch('/with-data', { query: { q: 1 } })).toMatchObject({ query: { q: '1' } })
    expect(await fetch('/with-data?q=1').then(res => res.json())).toMatchObject({ query: { q: '1' } })
  })

  it('can mock fetch requests with url including query param', async () => {
    registerEndpoint('/with-url-including-query-param/1?q=1', () => 'ok')

    expect(await $fetch('/with-url-including-query-param/1?q=1')).toBe('ok')
    expect(await fetch('/with-url-including-query-param/1?q=1').then(res => res.text())).toBe('ok')
  })

  it('fails when query params do not match', async () => {
    registerEndpoint('/with-url-including-query-param/2?q=2', () => 'ok')

    await expect($fetch('/with-url-including-query-param/2?q=3')).rejects.toMatchObject({ status: 404 })
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

    expect(await $fetch(request)).toMatchObject({ title: 'with-request', data: { q: '1' } })
    expect(await fetch(request).then(res => res.json())).toMatchObject({ title: 'with-request', data: { q: '1' } })

    expect(await $fetch(request, { method: 'POST', body: [1] })).toMatchObject({ title: 'with-request', data: [1] })
    expect(await fetch(request, { method: 'POST', body: '[1]' }).then(res => res.json())).toMatchObject({ title: 'with-request', data: [1] })
  })

  it('can mock fetch requests with FormData', async () => {
    registerEndpoint('/with-form-data', {
      method: 'POST',
      handler: event => readFormData(event).then(form => [...form.entries()]),
    })

    const createBody = () => {
      const form = new FormData()
      form.append('Name', 'Nuxt')
      form.append('Message', 'Hello')
      return form
    }
    const expected = [['Name', 'Nuxt'], ['Message', 'Hello']]

    expect(await $fetch('/with-form-data', { method: 'post', body: createBody() })).toEqual(expected)
    expect(await fetch('/with-form-data', { method: 'post', body: createBody() }).then(res => res.json())).toEqual(expected)
  })

  it('can mock fetch requests with Blob', async () => {
    registerEndpoint('/with-blob-data', {
      method: 'POST',
      handler: await import('#server/api/forms/blob.post').then(r => r.default),
    })

    const createBody = () => {
      return new File([Buffer.from('this is file', 'utf8')], 'hello1.txt', { type: 'text/plain' })
    }
    const expected = { body: 'this is file', contentType: 'text/plain' }

    expect(await $fetch('/with-blob-data', { method: 'post', body: createBody() })).toEqual(expected)
    expect(await fetch('/with-blob-data', { method: 'post', body: createBody() }).then(res => res.json())).toEqual(expected)
  })

  it('can mock fetch requests with FormData with files', async () => {
    registerEndpoint('/with-form-data-with-file', {
      method: 'POST',
      handler: await import('#server/api/forms/mutlipart.post').then(r => r.default),
    })

    const createBody = () => {
      const form = new FormData()
      form.append('meta', 'this is meta data')
      form.append('file', new File([Buffer.from('this is file 1', 'utf8')], 'hello1.txt', { type: 'text/plain' }))
      form.append('file', new File([Buffer.from('this is file 2', 'utf8')], 'hello2.txt', { type: 'text/plain' }))
      return form
    }

    const expected = [
      { name: 'meta', data: 'this is meta data' },
      { name: 'file', type: 'text/plain', filename: 'hello1.txt', data: 'this is file 1' },
      { name: 'file', type: 'text/plain', filename: 'hello2.txt', data: 'this is file 2' },
    ]

    expect(await $fetch('/with-form-data-with-file', { method: 'post', body: createBody() })).toMatchObject(expected)
    expect(await fetch('/with-form-data-with-file', { method: 'post', body: createBody() }).then(r => r.json())).toMatchObject(expected)
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

    expect(await fetch('/1')).toMatchObject({
      title: 'title from mocked api1',
      headers: { authorization: 'Bearer <access_token>' },
    })

    expect(await fetch('/2')).toMatchObject({
      title: 'title from mocked api2',
      headers: { authorization: 'Bearer <access_token>' },
    })

    await expect(fetch('/error')).rejects.toMatchObject({ status: 500, statusText: 'Mock Server Error' })
    await expect(fetch('/error', { baseURL: '"INVALID"' })).rejects.toThrow()

    expect(onRequest).toHaveBeenCalledTimes(4)
    expect(onResponse).toHaveBeenCalledTimes(3)
    expect(onRequestError).toHaveBeenCalledTimes(1)
    expect(onResponseError).toHaveBeenCalledTimes(1)
  })

  it('should mock request only once with once option', async () => {
    registerEndpoint('/with-once-options', { handler: () => '1', once: true })
    registerEndpoint('/with-once-options?q=1', { handler: () => '2', once: true })
    registerEndpoint('/with-once-options?q=2', { handler: () => '3', once: true })
    registerEndpoint('/with-once-options?q=2', { handler: () => '4', once: true })
    registerEndpoint('/with-once-options?q=2', { handler: () => '5', once: true })

    expect(await $fetch('/with-once-options?q=1')).toBe('1')
    expect(await $fetch('/with-once-options?q=1')).toBe('2')
    await expect($fetch('/with-once-options?q=1')).rejects.toMatchObject({ status: 404 })
    expect(await $fetch('/with-once-options?q=2')).toBe('5')
    expect(await $fetch('/with-once-options?q=2')).toBe('4')
    expect(await $fetch('/with-once-options?q=2')).toBe('3')
    await expect($fetch('/with-once-options?q=2')).rejects.toMatchObject({ status: 404 })
  })

  it('endpoint priority 1', async () => {
    registerEndpoint('/endpoint/priority/1?q=1', { handler: () => '1' })
    registerEndpoint('/endpoint/priority/1', { handler: () => '2' })

    expect(await $fetch('/endpoint/priority/1')).toBe('2')
    expect(await $fetch('/endpoint/priority/1?q=1')).toBe('1')
    expect(await $fetch('/endpoint/priority/1?q=1')).toBe('1')
  })

  it('endpoint priority 2', async () => {
    registerEndpoint('/endpoint/priority/2', { handler: () => '1' })
    registerEndpoint('/endpoint/priority/2?q=1', { handler: () => '2' })

    expect(await $fetch('/endpoint/priority/2')).toBe('1')
    expect(await $fetch('/endpoint/priority/2?q=1')).toBe('1')
    expect(await $fetch('/endpoint/priority/2?q=1')).toBe('1')
  })
})
