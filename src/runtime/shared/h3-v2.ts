import type { GenericApp } from '../../vitest-environment'

export async function createFetchForH3V2() {
  const { H3 } = await import('h3-next/generic')

  const h3App = new H3()
  const registry = new Set<string>()

  const _fetch = fetch
  const h3Fetch = (async (input, _init) => {
    let url: string
    let init = _init
    if (typeof input === 'string') {
      url = input
    }
    else if (input instanceof URL) {
      url = input.toString()
    }
    else {
      url = input.url
      init = {
        method: init?.method ?? input.method,
        body: init?.body ?? input.body,
        headers: init?.headers ?? input.headers,
      }
    }

    const base = url.split('?')[0]!
    if (registry.has(base) || registry.has(url)) {
      return h3App.fetch(new Request('/_' + url, init))
    }
    if (url.startsWith('/')) {
      return new Response('Not Found', { status: 404, statusText: 'Not Found' })
    }
    return _fetch(input, _init)
  }) as typeof fetch

  return {
    h3App: h3App as GenericApp,
    registry,
    fetch: h3Fetch,
  }
}
