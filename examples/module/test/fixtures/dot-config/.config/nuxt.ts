import MyModule from '../../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  runtimeConfig: {
    public: {
      myValue: 'original value',
    },
  },
  compatibilityDate: '2024-04-03',
})
