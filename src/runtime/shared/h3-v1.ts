import type { GenericApp } from '../../vitest-environment.ts'

export async function createFetchForH3V1() {
  // @ts-expect-error resolved to the project's h3 by the vitest config
  const { createApp, toWebHandler } = await (import('#nuxt-test-utils/h3') as Promise<typeof import('h3')>)

  const h3App = createApp()
  const webHandler = toWebHandler(h3App)

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
      url = '/_' + url
    }
    if (url.startsWith('/')) {
      return webHandler(new Request(new URL(url, 'http://localhost'), init))
    }
    return _fetch(input, _init)
  }) as typeof fetch

  return {
    h3App: h3App as GenericApp,
    registry,
    fetch: h3Fetch,
  }
}
