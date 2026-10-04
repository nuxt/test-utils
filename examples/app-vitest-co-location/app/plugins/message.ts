export default defineNuxtPlugin((nuxt) => {
  return {
    provide: {
      get message() {
        return `Hello Nuxt (${nuxt.$router.currentRoute.value.path})`
      },
    },
  }
})
