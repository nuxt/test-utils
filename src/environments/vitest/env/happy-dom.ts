import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow, PropertySymbol } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  (window as NuxtWindow).Headers = class Headers extends globalThis.Headers {
    // Make native Headers behave like happy-dom's Headers
    public get [PropertySymbol.entries]() {
      const entries: { [k: string]: { name: string, value: string[] } } = Object.create(null)
      for (const [key, val] of this) {
        const name = key.toLowerCase()
        entries[name] ||= { name, value: [] }
        entries[name].value.push(val)
      }
      return entries
    }
  }

  return {
    window,
    teardown() {
      window.happyDOM.abort()
    },
  }
}
