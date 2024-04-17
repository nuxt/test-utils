import { importModule } from 'local-pkg'
import type { EnvironmentNuxt, NuxtWindow } from '../types'

export default <EnvironmentNuxt> async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow } = (await importModule('happy-dom')) as typeof import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as InstanceType<typeof GlobalWindow> & NuxtWindow

  return {
    window,
    teardown() {
      window.happyDOM.cancelAsync()
    },
  }
}
