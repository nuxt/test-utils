import type { Plugin } from 'vue'

export const CUSTOM_VUE_PLUGIN_SYMBOL = Symbol.for('CUSTOM_VUE_PLUGIN_INJECTED')
// Imported `Symbol()` will not match across vi.resetModules() calls.
export const CUSTOM_VUE_PLUGIN_SYMBOL2 = Symbol('CUSTOM_VUE_PLUGIN_INJECTED2')

export const VUE_INJECTED_VALUE = 'injected vue plugin value'
export const VUE_INJECTED_VALUE2 = 'injected vue plugin value 2'

export default defineNuxtPlugin((nuxtApp) => {
  const vuePlugin: Plugin = {
    install(app) {
      app.provide(CUSTOM_VUE_PLUGIN_SYMBOL, VUE_INJECTED_VALUE)
      app.provide(CUSTOM_VUE_PLUGIN_SYMBOL2, VUE_INJECTED_VALUE2)
    },
  }

  nuxtApp.vueApp.use(vuePlugin)
})
