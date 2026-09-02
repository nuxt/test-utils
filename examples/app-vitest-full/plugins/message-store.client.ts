export default defineNuxtPlugin(() => {
  const message = useMessageStore()
  const getter = useMessageParent()

  const push1 = () => message.push(getter.get1())
  const push2 = () => message.push(getter.get2())
  const clear = () => message.clear()

  push1()
  push2()

  return {
    provide: {
      messageStorePlugin: {
        store: message.store,
        push1,
        push2,
        clear,
      },
    },
  }
})
