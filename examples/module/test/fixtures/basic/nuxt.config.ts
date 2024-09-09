import MyModule from '../../../src/module'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      myValue: 'original value',
    },
  },
  modules: [
    MyModule,
  ],
})
