export function useMessageParent() {
  const { get: get1 } = useMessageChild1()
  const { get: get2 } = useMessageChild2()
  return {
    get1: () => get1(),
    get2: () => get2(),
  }
}
