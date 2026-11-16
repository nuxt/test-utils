import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'
import { createCompatRequest } from './shared.ts'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow, PropertySymbol } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  const { Request: HappyDomRequest } = window
  const { Headers: NativeHeaders } = globalThis

  const win = window as unknown as typeof globalThis

  win.Headers = class Headers extends NativeHeaders {
    // Make native Headers behave like happy-dom's Headers
    public get [PropertySymbol.entries]() {
      const entries: { [k: string]: { name: string, value: string[] } } = Object.create(null)
      for (const [key, val] of this) {
        const name = key.toLowerCase()
        entries[name] ||= { name, value: [] }
        entries[name].value.push(val)
      }
      return new Proxy(entries, {
        deleteProperty: (_, property) => {
          Reflect.deleteProperty(entries, property)
          this.delete(String(property))
          return true
        },
      })
    }

    static override [Symbol.hasInstance](value: unknown): boolean {
      return value instanceof NativeHeaders
    }
  }

  win.Request = createCompatRequest({
    window: win,
    toRequestBlobBytes: blob => Reflect.get(blob, PropertySymbol.buffer),
    toRequestedFormData: async (request) => {
      const body = request.body ? Buffer.from(await request.arrayBuffer()) : null
      const formData = await new HappyDomRequest(request.url, {
        method: request.method,
        headers: new Headers(request.headers) as Headers & string[][],
        body,
      }).formData()
      return formData as unknown as FormData
    },
  })

  return {
    window,
    teardown() {
      window.happyDOM.abort()
    },
  }
}
