import { Suspense, defineComponent, h, onErrorCaptured, provide } from 'vue'
import { isNuxtError, useNuxtApp, useRoute } from '#imports'
import { PageRouteSymbol } from '#app/components/injections'

export default defineComponent({
  setup (_options, { slots }) {
    const nuxtApp = useNuxtApp()

    // Inject default route (outside of pages) as active route
    provide(PageRouteSymbol, useRoute())

    const done = nuxtApp.deferHydration()

    // vue:setup hook
    const results = nuxtApp.hooks.callHookWith(hooks => hooks.map(hook => hook()), 'vue:setup')
    if (import.meta.dev && results && results.some(i => i && 'then' in i)) {
      console.error('[nuxt] Error in `vue:setup`. Callbacks must be synchronous.')
    }

    // error handling
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook('vue:error', err, target, info).catch(hookError => console.error('[nuxt] Error in `vue:error` hook', hookError))
      if (isNuxtError(err) && (err.fatal || err.unhandled)) {
        return false // suppress error from breaking render
      }
    })

    return () => h(Suspense, { onResolve: done }, slots.default?.())
  }
})
