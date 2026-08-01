export const useCounter = () => {
  const count = ref(0)

  function isPositive() {
    return count.value > 0
  }

  return {
    count,
    isPositive,
  }
}
