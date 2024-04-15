import type { Plugin } from 'vue'

// TODO: investigate why `Symbol()` export without global registry doesn't match
export const CUSTOM_VUE_PLUGIN_SYMBOL = Symbol.for('CUSTOM_VUE_PLUGIN_INJECTED')

export const VUE_INJECTED_VALUE = 'injected vue plugin value'

export default defineNuxtPlugin((nuxtApp) => {
  const vuePlugin: Plugin = {
    install(app) {
      app.provide(CUSTOM_VUE_PLUGIN_SYMBOL, VUE_INJECTED_VALUE)
    },
  }

  nuxtApp.vueApp.use(vuePlugin)
})
