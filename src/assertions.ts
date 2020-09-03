import { getNuxt } from './nuxt'

type ModuleContainerMethod = 'addPlugin' | 'addLayout' | 'addErrorLayout' | 'addServerMiddleware' | 'requireModule'

export function expectModuleToBeCalledWith (method: ModuleContainerMethod, ...args: any[]) {
  expect(getNuxt().moduleContainer[method]).toBeCalledWith(...args)
}

export function expectModuleNotToBeCalledWith (method: ModuleContainerMethod, ...args: any[]) {
  expect(getNuxt().moduleContainer[method]).not.toBeCalledWith(...args)
}
