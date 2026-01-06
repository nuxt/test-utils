export const INJECTED_SYMBOL = Symbol()
export const INJECTED_VALUE = 'INJECTED_VALUE'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use({
    install(app) {
      app.provide(INJECTED_SYMBOL, INJECTED_VALUE)
    },
  })
})
