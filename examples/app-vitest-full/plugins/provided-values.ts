export default defineNuxtPlugin(() => {
  return {
    provide: {
      pluginProvidedValues: {
        value: 'pluginProvided.value',
        func: (value: string) => `pluginProvided.func(${value})`,
        object: { value: 'pluginProvided.object.value' },
      },
    },
  }
})
