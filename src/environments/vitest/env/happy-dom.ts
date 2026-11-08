import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow, PropertySymbol } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  const { Headers: NativeHeaders } = globalThis

  class Headers extends NativeHeaders {
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

  (window as NuxtWindow).Headers = Headers

  return {
    window,
    teardown() {
      window.happyDOM.abort()
    },
  }
}
