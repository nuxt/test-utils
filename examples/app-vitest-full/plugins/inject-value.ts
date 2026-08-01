import type { Plugin } from 'vue'

export const CUSTOM_VUE_PLUGIN_SYMBOL = Symbol.for('CUSTOM_VUE_PLUGIN_INJECTED')
export const VUE_INJECTED_VALUE = 'injected vue plugin value'

export const CUSTOM_VUE_PLUGIN_SYMBOL2 = Symbol('CUSTOM_VUE_PLUGIN_INJECTED_WITHOUT_GLOBAL_REGISTRY')
export const VUE_INJECTED_VALUE2 = 'injected vue plugin value without global registry'

export const CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY = Symbol('CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY')
export const VUE_INJECTED_ARRAY_VALUE = [1, 2, 3] as const

export default defineNuxtPlugin((nuxtApp) => {
  const vuePlugin: Plugin = {
    install(app) {
      app.provide(CUSTOM_VUE_PLUGIN_SYMBOL, VUE_INJECTED_VALUE)
      app.provide(CUSTOM_VUE_PLUGIN_SYMBOL2, VUE_INJECTED_VALUE2)
      app.provide(CUSTOM_VUE_PLUGIN_WITH_ARRAY_KEY, VUE_INJECTED_ARRAY_VALUE)
    },
  }

  nuxtApp.vueApp.use(vuePlugin)
})
