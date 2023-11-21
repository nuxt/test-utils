export default defineNuxtPlugin(_nuxtApp => {
  return {
    provide: {
      auth: {
        didInject: true,
      },
    },
  }
})
