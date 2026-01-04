import { getVueWrapperPlugin } from './vue-wrapper-plugin'

export async function setupNuxt() {
  const { useRouter } = await import('#app/composables/router')
  // @ts-expect-error alias to allow us to transform the entrypoint
  await import('#app/nuxt-vitest-app-entry').then(r => r.default())
  // We must manually call `page:finish` to sync route after navigation
  // as there is no `<NuxtPage>` instantiated by default.
  const nuxtApp = useNuxtApp()
  function sync() {
    return nuxtApp._route.sync
      ? nuxtApp._route.sync()
      : nuxtApp.callHook('page:finish')
  }
  const { hasNuxtPage } = getVueWrapperPlugin()
  useRouter().afterEach(() => {
    if (hasNuxtPage()) return
    return sync()
  })
  return sync()
}
