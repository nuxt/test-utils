import type { EnvironmentNuxt, NuxtWindow } from '../types'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow } = await import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  return {
    window,
    teardown() {
      window.happyDOM.abort()
    },
  }
}
