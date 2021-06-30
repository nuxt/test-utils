import { NuxtTestContext } from './context'

declare global {
  namespace NodeJS {
    interface Global {
      $nuxtTestContext: NuxtTestContext;
    }
  }
}
