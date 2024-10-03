export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('sample-directive', {
    created(el: Element) {
      el.setAttribute('data-directive', 'true')
    },
  })
})
