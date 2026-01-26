export default function useGlobalCounter() {
  const count = useState('GlobalCounter', () => 0)

  return {
    count,
    increment: () => {
      count.value++
      return count.value
    },
  }
}
