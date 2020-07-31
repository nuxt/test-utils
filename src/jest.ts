import { createContext, getContext } from './context'
import { loadNuxt, loadFixture } from './nuxt'
import { build } from './build'
import { generate } from './generate'
import { listen } from './server'
import { createBrowser } from './browser'
import { NuxtTestContext } from './types'

export function setupTest (options: Partial<NuxtTestContext>) {
  const ctx: NuxtTestContext = createContext(options)

  beforeAll(async () => {
    if (ctx.fixture) {
      await loadFixture()
    }

    if (!ctx.nuxt) {
      await loadNuxt()

      spyOnClass(ctx.nuxt.moduleContainer)

      await ctx.nuxt.ready()
    }

    if (ctx.build && !ctx.builder) {
      await build()
    }

    if (ctx.generate) {
      await generate()
    }

    if (ctx.waitFor) {
      await (new Promise(resolve => setTimeout(resolve, ctx.waitFor)))
    }

    if (ctx.server && !ctx.url) {
      await listen()
    }

    if (ctx.browser === true) {
      await createBrowser()
    }
  }, ctx.buildTimeout)

  afterAll(async () => {
    await cleanup()
  })

  return ctx
}

export async function cleanup () {
  const ctx = getContext()

  if (ctx.nuxt) {
    await ctx.nuxt.close()
  }

  if (ctx.browser) {
    await ctx.browser.close()
  }
}

export function spyOnClass (instance: any) {
  const proto = Object.getPrototypeOf(instance)
  for (const key of Object.getOwnPropertyNames(proto)) {
    jest.spyOn(instance, key)
  }
}
