import { NuxtTestContext } from './types'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveCalledNuxtAddPlugin(plugin: any): CustomMatcherResult
      toHaveCalledNuxtAddLayout(layout: any, name?: string): CustomMatcherResult
      toHaveCalledNuxtAddErrorLayout(errorLayout: any): CustomMatcherResult
      toHaveCalledNuxtAddServerMiddleware(middleware: any): CustomMatcherResult
      toHaveCalledNuxtRequireModule(moduleOpts: any): CustomMatcherResult
    }
  }
}

expect.extend({
  toHaveCalledNuxtAddPlugin (ctx: NuxtTestContext, plugin: any) {
    expect(ctx.nuxt.moduleContainer.addPlugin).toBeCalledWith(plugin)

    return { pass: true, message: () => '' }
  },

  toHaveCalledNuxtAddLayout (ctx: NuxtTestContext, layout: any, name?: string) {
    if (name) {
      expect(ctx.nuxt.moduleContainer.addLayout).toBeCalledWith(layout, name)
    } else {
      expect(ctx.nuxt.moduleContainer.addLayout).toBeCalledWith(layout)
    }

    return { pass: true, message: () => '' }
  },

  toHaveCalledNuxtAddErrorLayout (ctx: NuxtTestContext, errorLayout: any) {
    expect(ctx.nuxt.moduleContainer.addErrorLayout).toBeCalledWith(errorLayout)

    return { pass: true, message: () => '' }
  },

  toHaveCalledNuxtAddServerMiddleware (ctx: NuxtTestContext, middleware: any) {
    expect(ctx.nuxt.moduleContainer.addServerMiddleware).toBeCalledWith(middleware)

    return { pass: true, message: () => '' }
  },

  toHaveCalledNuxtRequireModule (ctx: NuxtTestContext, moduleOpts: any) {
    expect(ctx.nuxt.moduleContainer.requireModule).toBeCalledWith(moduleOpts)

    return { pass: true, message: () => '' }
  }
})
