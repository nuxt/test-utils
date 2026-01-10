export default defineNuxtRouteMiddleware((_to, _from) => {
  useGlobalCounter().increment()
})
