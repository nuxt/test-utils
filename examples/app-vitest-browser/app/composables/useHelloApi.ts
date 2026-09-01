export function useHelloApi(name: Ref<string>) {
  const {
    data,
    pending,
  } = useFetch('/api/hello', {
    query: reactive({ name }),
    default: () => ({ message: '' }),
  })

  return {
    data,
    pending,
  }
}
