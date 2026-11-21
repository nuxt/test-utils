export default defineNuxtConfig({
  modules: ['./local-modules/baz'],
  imports: {
    autoImport: true,
  },
  buildDir: '.nuxt',
})
