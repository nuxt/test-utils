import { createContext, setContext, NuxtTestOptions, NuxtTestContext, getContext } from './context'
import { loadNuxt, loadFixture } from './nuxt'
import { build } from './build'
import { generate } from './generate'
import { listen } from './server'
import { createBrowser } from './browser'

export function setupTest (options: Partial<NuxtTestOptions>) {
  const ctx = createContext(options)

  beforeEach(() => {
    setContext(ctx)
  })

  afterEach(() => {
    setContext(undefined)
  })

  afterAll(async () => {
    await teardownNuxtTest(ctx)
  })

  test('setup nuxt', async () => {
    await setupNuxtTest(ctx)
  }, ctx.options.setupTimeout)
}

export async function setupNuxtTest (nuxtTestContext?: NuxtTestContext, spy: Boolean = true) {
  const ctx = nuxtTestContext || getContext()

  if (ctx.options.fixture) {
    await loadFixture()
  }

  if (!ctx.nuxt) {
    await loadNuxt()

    if (spy) {
      spyOnClass(ctx.nuxt.moduleContainer)
    }

    await ctx.nuxt.ready()
  }

  if (ctx.options.build) {
    await build()
  }

  if (ctx.options.server) {
    await listen()
  }

  if (ctx.options.generate) {
    await generate()
  }

  if (ctx.options.waitFor) {
    await (new Promise(resolve => setTimeout(resolve, ctx.options.waitFor)))
  }

  if (ctx.options.browser) {
    await createBrowser()
  }
}

export async function teardownNuxtTest (nuxtTestContext?: NuxtTestContext) {
  const ctx = nuxtTestContext || getContext()

  if (ctx.nuxt) {
    await ctx.nuxt.close()
  }

  if (ctx.browser) {
    await ctx.browser.close()
  }

  setContext(undefined)
}

export function spyOnClass (instance: any) {
  const proto = Object.getPrototypeOf(instance)
  for (const key of Object.getOwnPropertyNames(proto)) {
    jest.spyOn(instance, key)
  }
}
