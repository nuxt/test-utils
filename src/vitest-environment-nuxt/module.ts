import { defineNuxtModule, installModule } from '@nuxt/kit'
import mockTransform from './modules/mock'

export default defineNuxtModule({
  meta: {
    name: 'vitest-env',
  },
  async setup() {
    await installModule(mockTransform)
  },
})
