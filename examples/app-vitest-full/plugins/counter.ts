export default defineNuxtPlugin(() => {
  const counter = useCounter()
  return {
    provide: {
      counter,
    },
  }
})
