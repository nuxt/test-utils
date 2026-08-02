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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it(useGlobalCounter, () => {
    const { count, increment } = useGlobalCounter()
    const incremented = count.value + 1
    expect(increment()).toBe(incremented)
  })

  it('window', () => {
    expect(typeof window).toBe('object')
  })
}
