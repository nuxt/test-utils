import { importModule } from 'local-pkg'
import type { EnvironmentNuxt } from '../types'

export default <EnvironmentNuxt>async function (_, { happyDom = {} }) {
  const { Window, GlobalWindow } = (await importModule(
    'happy-dom'
  )) as typeof import('happy-dom')
  const window = new (GlobalWindow || Window)(happyDom) as any

  return {
    window,
    teardown() {
      window.happyDOM.cancelAsync()
    },
  }
}
