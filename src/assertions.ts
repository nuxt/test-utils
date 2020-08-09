import { getNuxt } from './nuxt'

type ModuleContainerMethod = 'addPlugin' | 'addLayout' | 'addErrorLayout' | 'addServerMiddleware' | 'requireModule'

export function expectModuleToBeCalledWith (method: ModuleContainerMethod, ...args) {
  const _args = []
  for (const arg of args) {
    if (arg === undefined) {
      break
    }
    _args.push(arg)
  }

  expect(getNuxt().moduleContainer[method]).toBeCalledWith(..._args)
}
