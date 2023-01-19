import { defineNuxtModule, installModule } from '@nuxt/kit'
import autoImportMock from './modules/auto-import-mock'

export default defineNuxtModule({
  meta: {
    name: 'vitest-env',
  },
  async setup() {
    await installModule(autoImportMock)
  },
})
