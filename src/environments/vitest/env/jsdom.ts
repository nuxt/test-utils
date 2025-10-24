import { importModule } from 'local-pkg'
import type { DOMWindow, SupportedContentTypes } from 'jsdom'
import defu from 'defu'
import type { JSDOMOptions } from 'vitest/node'
import type { EnvironmentNuxt, NuxtWindow } from '../types'

export default <EnvironmentNuxt> async function (global, { jsdom = {} }) {
  const { CookieJar, JSDOM, ResourceLoader, VirtualConsole } = (await importModule('jsdom')) as typeof import('jsdom')
  const jsdomOptions = defu(jsdom, {
    html: '<!DOCTYPE html>',
    url: 'http://localhost:3000',
    contentType: 'text/html' as const,
    pretendToBeVisual: true,
    includeNodeLocations: false,
    runScripts: 'dangerously',
    console: false,
    cookieJar: false,
  } satisfies JSDOMOptions) as JSDOMOptions & { contentType: SupportedContentTypes }

  const virtualConsole = jsdomOptions.console && global.console
    ? new VirtualConsole()
    : undefined

  const window = new JSDOM(jsdomOptions.html, {
    ...jsdomOptions,
    resources: jsdomOptions.resources ?? (jsdomOptions.userAgent ? new ResourceLoader({ userAgent: jsdomOptions.userAgent }) : undefined),
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
    teardown() {},
  }
}
