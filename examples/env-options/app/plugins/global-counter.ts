export default defineNuxtPlugin(() => {
  return {
    provide: {
      counter: useGlobalCounter(),
    },
  }
})
