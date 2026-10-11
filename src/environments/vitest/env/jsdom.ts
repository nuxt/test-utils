import type { DOMWindow, SupportedContentTypes, ConstructorOptions } from 'jsdom'
import defu from 'defu'
import type { EnvironmentOptions } from 'vitest/node'
import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'

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

  window.URLSearchParams = globalThis.URLSearchParams

  const { Blob: NodeBlob, File: NodeFile, FormData: NodeFormData } = globalThis

  const getImplement = await loadGetImplement()

  const toNodeBinData = (val: Blob | File) => {
    const impl = getImplement<{ _bytes?: ArrayBuffer, _buffer: ArrayBuffer }>(val)
    const bits = [impl?._bytes ?? impl?._buffer ?? val]
    if (val instanceof window.File) {
      const { name: filename, type, lastModified } = val
      return new NodeFile(bits, filename, { type, lastModified })
    }
    return new NodeBlob(bits, { type: val.type })
  }

  window.Request = class Request extends globalThis.Request {
    constructor(input: RequestInfo, init?: RequestInit) {
      if (init?.body) {
        init = { ...init }
        if (init.body instanceof window.FormData) {
          const form = new NodeFormData()
          init.body.forEach((val, key) => {
            form.append(key, val instanceof window.Blob ? toNodeBinData(val) : val)
          })
          init.body = form
        }
        else if (init.body instanceof window.Blob) {
          init.body = toNodeBinData(init.body)
        }
      }

      if (typeof input === 'string') {
        super(new URL(input, window.location.origin), init)
      }
      else {
        super(input, init)
      }
    }
  }

  return {
    window,
    teardown() {
      window.close()
    },
  }
}

let _getImplement: <I extends object>(o: unknown) => I | undefined
async function loadGetImplement() {
  async function load(): Promise<typeof _getImplement> {
    for (const path of ['lib/generated/idl', 'lib/jsdom/living/generated']) {
      try {
        const { implForWrapper } = await import(/* @vite-ignore */ ['jsdom', path, 'utils.js'].join('/')).then(r => r.default)
        return implForWrapper
      }
      catch {
        // ignore
      }
    }
    console.warn('[@nuxt/test-utils] jsdom\'s `implForWrapper` not found in nuxt environment.')
    return () => {}
  }
  return _getImplement ||= await load()
}
