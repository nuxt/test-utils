export function useCounter() {
  const count = ref(0)

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  return { count, increment, decrement }
}
