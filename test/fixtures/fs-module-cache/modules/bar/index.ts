import { addImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import { target } from './target'

export default defineNuxtModule({
  setup() {
    const { resolve } = createResolver(import.meta.url)
    addImports({ name: 'useBar', from: resolve(`../../targets/${target}`) })
  },
})
