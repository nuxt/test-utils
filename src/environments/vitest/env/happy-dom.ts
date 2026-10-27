import type { EnvironmentNuxt, NuxtWindow } from '../types.ts'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  const win = window as NuxtWindow

  const { Headers: HappyDomHeaders } = win

  win.Headers = class Headers extends HappyDomHeaders {
    constructor(init?: HeadersInit) {
      if (init && Symbol.iterator in init && !(init instanceof HappyDomHeaders)) {
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
