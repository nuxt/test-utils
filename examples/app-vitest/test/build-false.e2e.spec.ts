import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { loadNuxt, buildNuxt } from '@nuxt/kit'

const rootDir = fileURLToPath(new URL('../', import.meta.url))
const randomId = Math.random().toString(36).slice(2, 8)
const buildDir = resolve(rootDir, '.nuxt', 'test', randomId)
const buildOutput = resolve(buildDir, 'output')
const nuxt = await loadNuxt({
  cwd: rootDir,
  overrides: {
    buildDir,
    nitro: {
      output: {
        dir: buildOutput,
      },
    },
  },
})
await buildNuxt(nuxt)
await setup({
  rootDir,
  buildDir,
  nuxtConfig: {
    nitro: {
      output: {
        dir: buildOutput,
      },
    },
  },
  build: false,
})

describe('build: false', () => {
  it('runs a test', async () => {
    const html = await $fetch('/')
    expect(html.slice(0, 15)).toMatchInlineSnapshot(`
      "<!DOCTYPE html>"
    `)
  })
})
