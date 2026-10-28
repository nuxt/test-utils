import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  const win = window as NuxtWindow

  const { Headers: NaviveHeaders } = globalThis

  // We do not populate happy-dom's Headers, but we use it for $fetch as well.
  win.Headers = class Headers extends win.Headers {
    constructor(init?: HeadersInit) {
      // happy-dom's Headers copies object with Object.keys(), which loses native Headers.
      if (init && init instanceof NaviveHeaders) {
        super([...init])
      }
      else {
        super(init)
      }
    }
  }

  return {
    window,
    teardown() {
      window.happyDOM.abort()
    },
  }
}
