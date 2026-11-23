import { addImports, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup() {
    const { resolve } = createResolver(import.meta.url)
    addImports({ name: 'useBaz', from: resolve('../targets/one') })
  },
})
