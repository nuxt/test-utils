export default defineNuxtPlugin((nuxt) => {
  return {
    provide: {
      message() {
        return `${useMessage()} (${nuxt.$router.currentRoute.value.path})`
      },
    },
  }
})
