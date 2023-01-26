import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'custom',
  },
  setup(_, _nuxt) {
    console.log('From custom module!')
  },
})
