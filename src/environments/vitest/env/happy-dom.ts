import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'
import { createCompatRequest } from './shared.ts'

export default <EnvironmentNuxt> async function (global, { happyDom = {} }) {
  const { Window, GlobalWindow, PropertySymbol } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow
  const win = window as unknown as typeof globalThis

  const { Headers: NativeHeaders } = globalThis
  const { Request: HappyDomRequest, Blob: HappyDomBlob } = win

  win.Headers = class Headers extends NativeHeaders {
    constructor(init?: HeadersInit) {
      super(init ?? undefined)
    }

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

  const CompatRequest = class Request extends createCompatRequest({
    window: win,
    toBlobBytes: blob => Reflect.get(blob, PropertySymbol.buffer),
  }) {
    override async blob(): Promise<Blob> {
      const blob = await super.blob()
      return new HappyDomBlob([await blob.arrayBuffer()], {
        type: blob.type,
      })
    }

    override async formData(): Promise<FormData> {
      const formData = await new HappyDomRequest(this.url, {
        method: this.method,
        headers: new Headers(this.headers) as Headers & string[][],
        body: this.body ? await this.blob() as never : null,
      }).formData()
      return formData as unknown as FormData
    }
  }

  return {
    window,
    onPopulated() {
      // Overriding global.Request also overrides window.Request in vitest,
      // so after setting global.Request, restore HappyDom's Request for internal consumers
      Reflect.set(global, 'Request', CompatRequest)
      Reflect.set(window, 'Request', HappyDomRequest)
    },
    teardown() {
      window.happyDOM.abort()
    },
  }
}
