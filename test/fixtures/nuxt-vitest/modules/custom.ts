import { defineNuxtModule, createResolver, addImports } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'custom',
  },
  setup(_, _nuxt) {
    console.log('From custom module!')

    const { resolve } = createResolver(import.meta.url)

    addImports([
      {
        name: 'useCustomModuleAutoImportedTarget',
        from: resolve('runtime/composables/auto-import-mock'),
      },
      {
        name: 'useCustomModuleAutoImportedNonTarget',
        from: resolve('runtime/composables/auto-import-mock'),
      },
    ])
  },
})
