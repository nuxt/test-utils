import type { DOMWindow, SupportedContentTypes, ConstructorOptions } from 'jsdom'
import defu from 'defu'
import type { EnvironmentOptions } from 'vitest/node'
import type { EnvironmentNuxt, NuxtWindow } from '../types'

export default <EnvironmentNuxt> async function (global, { jsdom = {} }) {
  const { CookieJar, JSDOM, ResourceLoader, VirtualConsole } = await import('jsdom') as typeof import('jsdom') & {
    ResourceLoader?: { new(...args: unknown[]): ConstructorOptions['resources'] }
  }
  const jsdomOptions = defu(jsdom, {
    html: '<!DOCTYPE html>',
    url: 'http://localhost:3000',
    contentType: 'text/html' as const,
    pretendToBeVisual: true,
    includeNodeLocations: false,
    runScripts: 'dangerously',
    console: false,
    cookieJar: false,
  } satisfies EnvironmentOptions['jsdom']) as EnvironmentOptions['jsdom'] & { contentType: SupportedContentTypes }

  const virtualConsole = jsdomOptions.console && global.console
    ? new VirtualConsole()
    : undefined

  const window = new JSDOM(jsdomOptions.html, {
    ...jsdomOptions,
    resources: jsdomOptions.resources ?? (jsdomOptions.userAgent
      // `ResourceLoader` usage can be removed when dropping support for jsdom v27.x
      ? ResourceLoader
        ? new ResourceLoader({ userAgent: jsdomOptions.userAgent })
        : { userAgent: jsdomOptions.userAgent }
      : undefined),
    virtualConsole: virtualConsole
      ? 'sendTo' in virtualConsole
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (virtualConsole.sendTo as any)(global.console)
        : virtualConsole.forwardTo(global.console)
      : undefined,
    cookieJar: jsdomOptions.cookieJar ? new CookieJar() : undefined,
  }).window as DOMWindow & NuxtWindow

  // Vue-router relies on scrollTo being available if run in a browser.
  // The scrollTo implementation from JSDOM throws a "Not Implemented" error
  window.scrollTo = () => {}

  return {
    window,
    teardown() {
      window.close()
    },
  }
}
