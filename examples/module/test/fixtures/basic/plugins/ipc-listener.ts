import defu from 'defu'
import { defineNuxtPlugin } from 'nuxt/app'

declare global {
  interface Window {
    __NUXT_TEST_RUNTIME_CONFIG_SETTER__: (env: { public: Record<string, unknown> }) => void
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  if (process.client) {
    window.__NUXT_TEST_RUNTIME_CONFIG_SETTER__ ??= (env: { public: Record<string, unknown> }) => {
      config.public = defu(env.public, config.public)
    }
  }

  if (process.server) {
    process.on('message', (msg: { type: string; value: Record<string, string> }) => {
      if (msg.type === 'update:runtime-config') {
        for (const [key, value] of Object.entries(msg.value)) {
          process.env[key] = value
        }

        process!.send!({ type: 'confirm:runtime-config' })
      }
    })
  }
})
