import { snakeCase } from 'scule'
import { useTestContext } from './context'

export function flattenObject(obj: Record<string, unknown> = {}) {
  const flattened: Record<string, unknown> = {}

  for (const key in obj) {
    if (!(key in obj)) continue

    const entry = obj[key]
    if (typeof entry !== 'object' || entry == null) {
      flattened[key] = obj[key]
      continue
    }
    const flatObject = flattenObject(entry as Record<string, unknown>)

    for (const x in flatObject) {
      if (!(x in flatObject)) continue

      flattened[key + '_' + x] = flatObject[x]
    }
  }

  return flattened
}

export function convertObjectToConfig(obj: Record<string, unknown>, envPrefix: string) {
  const makeEnvKey = (str: string) => `${envPrefix}${snakeCase(str).toUpperCase()}`

  const env: Record<string, unknown> = {}
  const flattened = flattenObject(obj)
  for (const key in flattened) {
    env[makeEnvKey(key)] = flattened[key]
  }

  return env
}

export async function setRuntimeConfig(config: Record<string, unknown>, envPrefix = 'NUXT_') {
  const env = convertObjectToConfig(config, envPrefix)
  const ctx = useTestContext()

  let updatedConfig = false
  ctx.serverProcess?.once('message', (msg: { type: string }) => {
    if (msg.type === 'confirm:runtime-config') {
      updatedConfig = true
    }
  })

  ctx.serverProcess?.send({ type: 'update:runtime-config', value: env })

  // Wait for confirmation to ensure
  for (let i = 0; i < 10; i++) {
    if (updatedConfig) break
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  if (!updatedConfig) {
    throw new Error('Missing confirmation of runtime config update!')
  }
}
