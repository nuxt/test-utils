export const CUSTOM_VUE_PLUGIN_SYMBOL = Symbol('CUSTOM_VUE_PLUGIN_INJECTED')

export const VUE_INJECTED_VALUE = 'injected vue plugin value'

export default defineNuxtPlugin((nuxtApp) => {
  const vuePlugin = {
    install(app: any) {
      app.provide(CUSTOM_VUE_PLUGIN_SYMBOL, VUE_INJECTED_VALUE)
    },
  }

  nuxtApp.vueApp.use(vuePlugin)
})