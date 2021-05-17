import { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
  head: {
    title: 'Testing Nuxt App',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  components: true,
  buildModules: [
    '@nuxt/typescript-build'
  ]
}

export default config
