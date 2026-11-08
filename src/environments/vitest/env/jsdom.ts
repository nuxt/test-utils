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
  window.Headers = globalThis.Headers

  const { Blob: NodeBlob, File: NodeFile, FormData: NodeFormData } = globalThis

  const getImplement = await loadGetImplement()

  const toNodeBlobLike = (val: Blob | File) => {
    // `_buffer` usage can be removed when dropping support for jsdom v27.x
    const impl = getImplement<{ _bytes?: Uint8Array<ArrayBuffer>, _buffer?: Uint8Array<ArrayBuffer> }>(val)
    const bytes = impl?._bytes ?? impl?._buffer
    if (!bytes) {
      throw createJsdomCompatError('Cannot read the bytes of Blob/File')
    }
    if (val instanceof window.File) {
      const { name: filename, type, lastModified } = val
      return new NodeFile([bytes], filename, { type, lastModified })
    }
    return new NodeBlob([bytes], { type: val.type })
  }

  const toNodePayload = (init?: RequestInit) => {
    if (init?.body) {
      if (init.body instanceof window.FormData) {
        const form = new NodeFormData()
        init.body.forEach((val, key) => {
          form.append(key, val instanceof window.Blob ? toNodeBlobLike(val) : val)
        })
        return { ...init, body: form }
      }
      else if (init.body instanceof window.Blob) {
        return { ...init, body: toNodeBlobLike(init.body) }
      }
    }
    return init
  }

  window.Request = class Request extends globalThis.Request {
    constructor(input: RequestInfo, init?: RequestInit) {
      if (typeof input === 'string') {
        super(new URL(input, window.location.origin), toNodePayload(init))
      }
      else {
        super(input, toNodePayload(init))
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
    for (const path of [
      'lib/generated/idl', // v28.1.0+
      'lib/jsdom/living/generated', // v28.0.x and earlier
    ]) {
      try {
        const { implForWrapper } = await import(/* @vite-ignore */ ['jsdom', path, 'utils.js'].join('/')).then(r => r.default)
        if (typeof implForWrapper === 'function') {
          return implForWrapper
        }
      }
      catch {
        // ignore
      }
    }
    return () => {
      throw createJsdomCompatError('Cannot load jsdom\'s `implForWrapper` in nuxt environment')
    }
  }
  return _getImplement ||= await load()
}

function createJsdomCompatError(message: string) {
  return new Error(`${message}. Please report this to @nuxt/test-utils with your jsdom version.`)
}
