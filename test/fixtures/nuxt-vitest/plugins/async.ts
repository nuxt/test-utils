export default defineNuxtPlugin(async _nuxtApp => {
  await new Promise(resolve => {
    setTimeout(resolve, 1000)
  })

  return {
    provide: {
      async: {
        didInject: true,
      },
    },
  }
})
