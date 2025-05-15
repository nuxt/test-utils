export async function setupNuxt() {
  const { useRouter } = await import('#app/composables/router')
  // @ts-expect-error alias to allow us to transform the entrypoint
  await import('#app/nuxt-vitest-app-entry').then(r => r.default())
  // We must manually call `page:finish` to snc route after navigation
  // as there is no `<NuxtPage>` instantiated by default.
  const nuxtApp = useNuxtApp()
  await nuxtApp.callHook('page:finish')
  useRouter().afterEach(() => nuxtApp.callHook('page:finish'))
}
