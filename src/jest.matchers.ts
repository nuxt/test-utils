import { NuxtTestContext } from './types'

declare global {
  namespace jest {
    interface Matchers<R> {
      toNuxtPluginAdded(plugin: any): CustomMatcherResult
      toNuxtLayoutAdded(layout: any, name?: string): CustomMatcherResult
      toNuxtErrorLayoutAdded(errorLayout: any): CustomMatcherResult
      toNuxtServerMiddlewareAdded(middleware: any): CustomMatcherResult
      toNuxtRequireModule(moduleOpts: any): CustomMatcherResult
    }
  }
}

expect.extend({
  toNuxtPluginAdded (ctx: NuxtTestContext, plugin: any) {
    expect(ctx.nuxt.moduleContainer.addPlugin).toBeCalledWith(plugin)

    return { pass: true, message: () => '' }
  },

  toNuxtLayoutAdded (ctx: NuxtTestContext, layout: any, name?: string) {
    if (name) {
      expect(ctx.nuxt.moduleContainer.addLayout).toBeCalledWith(layout, name)
    } else {
      expect(ctx.nuxt.moduleContainer.addLayout).toBeCalledWith(layout)
    }

    return { pass: true, message: () => '' }
  },

  toNuxtErrorLayoutAdded (ctx: NuxtTestContext, errorLayout: any) {
    expect(ctx.nuxt.moduleContainer.addErrorLayout).toBeCalledWith(errorLayout)

    return { pass: true, message: () => '' }
  },

  toNuxtServerMiddlewareAdded (ctx: NuxtTestContext, middleware: any) {
    expect(ctx.nuxt.moduleContainer.addServerMiddleware).toBeCalledWith(middleware)

    return { pass: true, message: () => '' }
  },

  toNuxtRequireModule (ctx: NuxtTestContext, moduleOpts: any) {
    expect(ctx.nuxt.moduleContainer.requireModule).toBeCalledWith(moduleOpts)

    return { pass: true, message: () => '' }
  }
})
