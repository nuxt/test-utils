export function useMessageStore() {
  const store = useState<string[]>('useMessageStore', () => [])
  return {
    store: readonly(store),
    push(message: string) {
      store.value.push(message)
    },
    clear() {
      store.value = []
    },
  }
}
