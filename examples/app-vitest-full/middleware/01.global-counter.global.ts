export default defineNuxtRouteMiddleware((to, _from) => {
  const { increment } = useGlobalCounter()
  if (to.path === '/count/just/1000') return
  if (increment() === 1000) {
    return navigateTo('/count/just/1000')
  }
})
