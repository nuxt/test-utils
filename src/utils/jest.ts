import { createContext } from './context'
import { loadNuxt, loadFixture } from './nuxt'
import { build } from './build'
import { listen } from './server'
import { createBrowser } from './browser'
import { getContext } from './context'
import { NuxtTestContext } from './types'

export function setupTest(options: Partial<NuxtTestContext>) {
  const ctx: NuxtTestContext = createContext(options)

  beforeAll(async () => {
    if (ctx.fixture) {
      await loadFixture()
    }

    if (!ctx.nuxt) {
      await loadNuxt()
    }

    if (ctx.build && !ctx.builder) {
      await build()
    }

    if (ctx.server && !ctx.url) {
      await listen()
    }

    if (ctx.browser && !ctx.puppeteer) {
      await createBrowser()
    }
  }, ctx.buildTimeout)

  afterAll(async () => {
    await cleanup()
  })

  return ctx
}

export async function cleanup() {
  const ctx = getContext()

  if (ctx.nuxt) {
    await ctx.nuxt.close()
  }
  if (ctx.browser) {
    await ctx.browser.close()
  }
}

export function spyOnClass (instance) {
  const proto = Object.getPrototypeOf(instance)
  for (const key of Object.getOwnPropertyNames(proto)) {
    jest.spyOn(instance, key)
  }
}

expect.extend({
  toNuxtPluginAdded(plugin, ctx) {
    expect(ctx.nuxt.moduleContainer.addPlugin).toBeCalledWith(plugin)
    return { pass: true }
  }
})
