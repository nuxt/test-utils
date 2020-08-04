import theme from '@nuxt/content-theme-docs'

export default theme({
  generate: {
    fallback: '404.html',
    routes: ['/']
  }
})
