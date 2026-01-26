import { config } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'

type Options = ReturnType<typeof createPluginOptions>

const PLUGIN_NAME = 'nuxt-test-utils'

export function getVueWrapperPlugin(): Options {
  const installed = config.plugins.VueWrapper.installedPlugins
    .find(({ options }) => options?._name === PLUGIN_NAME)

  if (installed) return installed.options

  const options = createPluginOptions()

  config.plugins.VueWrapper.install((instance, options) => {
    options.addInstance(instance)
    return {}
  }, options)

  return options
}

function createPluginOptions() {
  const options = {
    _name: PLUGIN_NAME,
    _instances: [] as WeakRef<VueWrapper>[],
    get instances() {
      const instances: VueWrapper[] = []
      options._instances = options._instances.filter((ref) => {
        const instance = ref.deref()
        if (!instance) return false
        instances.push(instance)
        return true
      })
      return instances
    },
    addInstance(instance: VueWrapper) {
      if (options.instances.includes(instance)) return
      options._instances.push(new WeakRef(instance))
    },
    hasNuxtPage() {
      return options._hasComponent('NuxtPage')
    },
    _hasComponent(componentName: string) {
      return options.instances.some(v =>
        v.exists() && v.findComponent({ name: componentName }).exists(),
      )
    },
  }
  return options
}
