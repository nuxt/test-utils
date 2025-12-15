export default defineNuxtRouteMiddleware((_to, _from) => {
  const value = useInsideGlobalMiddleware()

  if (value) {
    return abortNavigation(value)
  }
})
