export default defineNuxtPlugin((nuxt) => {
  return {
    provide: {
      message() {
        return `Hello Nuxt (${nuxt.$router.currentRoute.value.path})`
      },
    },
  }
})
