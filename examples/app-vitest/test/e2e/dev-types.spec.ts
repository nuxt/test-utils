import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('../../', import.meta.url))
const projectTypes = fileURLToPath(new URL('../../.nuxt/nuxt.d.ts', import.meta.url))
const readProjectTypes = () => existsSync(projectTypes) ? readFileSync(projectTypes, 'utf-8') : undefined

const typesBeforeSetup = readProjectTypes()

await setup({
  rootDir,
  dev: true,
})

describe('server (dev) generated types', () => {
  it('does not point the project `.nuxt` types at the temporary build dir', async () => {
    await $fetch<string>('/')
    expect(readProjectTypes()).toBe(typesBeforeSetup)
  })
})
