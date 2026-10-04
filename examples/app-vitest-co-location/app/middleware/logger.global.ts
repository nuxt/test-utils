export default defineNuxtRouteMiddleware((to, from) => {
  console.log(to.path, from.path)
})
