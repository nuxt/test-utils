export default defineNuxtRouteMiddleware((_to, _from) => {
  const value = useInsideNamedMiddleware()

  if (value) {
    return abortNavigation(value)
  }
})
