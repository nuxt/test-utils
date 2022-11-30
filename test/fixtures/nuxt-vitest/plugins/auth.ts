export default defineNuxtPlugin(nuxtApp => {
  return {
    provide: {
      auth: {
        didInject: true
      }
    }
  }
})
