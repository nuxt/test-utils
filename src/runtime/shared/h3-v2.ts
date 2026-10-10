import type { GenericApp } from '../../vitest-environment.ts'

export async function createFetchForH3V2() {
  // @ts-expect-error resolved to the project's h3 by the vitest config
  const { H3 } = await (import('#nuxt-test-utils/h3') as Promise<{ H3: new () => GenericApp & { fetch: (request: Request) => Promise<Response> } }>)

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
    h3App,
    registry,
    fetch: h3Fetch,
  }
}
