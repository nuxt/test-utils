import { getNuxt } from './nuxt'

type ModuleContainerMethod = 'addPlugin' | 'addLayout' | 'addErrorLayout' | 'addServerMiddleware' | 'requireModule'

export function expectModuleToBeCalledWith (method: ModuleContainerMethod, ...args) {
  expect(getNuxt().moduleContainer[method]).toBeCalledWith(...args)
}
