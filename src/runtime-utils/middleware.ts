import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  Router,
} from 'vue-router'

import { useNuxtApp, useRouter } from '#imports'

interface RouteMiddlewareLike {
  (to: RouteLocationNormalized, from: RouteLocationNormalized): ReturnType<NavigationGuard>
}

export type RouteMiddlewareLocation = RouteLocationRaw | RouteLocationNormalized

export interface RunRouteMiddlewareOptions {
  /** The route being navigated to. */
  to: RouteMiddlewareLocation
  /**
   * The route being navigated from.
   * @default The router's current route.
   */
  from?: RouteMiddlewareLocation
}

function isNormalizedRoute(location: RouteMiddlewareLocation): location is RouteLocationNormalized {
  return typeof location === 'object' && 'matched' in location
}

function resolveRoute(
  router: Router,
  location: RouteMiddlewareLocation,
  currentLocation?: RouteLocationNormalized,
): RouteLocationNormalized {
  if (isNormalizedRoute(location)) {
    return location
  }

  // Vue Router's resolved route type allows a nullable name, while Nuxt's middleware type does not.
  return router.resolve(location, currentLocation as RouteLocationNormalizedLoaded | undefined) as RouteLocationNormalized
}

/**
 * Returns the middleware result as-is without performing an actual route navigation.
 *
 * @param middleware The route middleware to run.
 * @param options The routes to pass to the middleware.
 */
export async function runRouteMiddleware<T extends RouteMiddlewareLike>(
  middleware: T,
  options: RunRouteMiddlewareOptions,
): Promise<Awaited<ReturnType<T>>> {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  const from = resolveRoute(router, options.from ?? router.currentRoute.value)
  const to = resolveRoute(router, options.to, from)

  const previousProcessingMiddleware = nuxtApp._processingMiddleware
  const previousMiddlewareTo = nuxtApp._middlewareTo

  nuxtApp._processingMiddleware = (middleware as RouteMiddlewareLike & { _path?: string })._path || true
  if (import.meta.server) {
    nuxtApp._middlewareTo = to
  }

  try {
    return await nuxtApp.runWithContext(() => middleware(to, from)) as Awaited<ReturnType<T>>
  }
  finally {
    if (previousProcessingMiddleware === undefined) {
      delete nuxtApp._processingMiddleware
    }
    else {
      nuxtApp._processingMiddleware = previousProcessingMiddleware
    }

    if (import.meta.server) {
      if (previousMiddlewareTo === undefined) {
        delete nuxtApp._middlewareTo
      }
      else {
        nuxtApp._middlewareTo = previousMiddlewareTo
      }
    }
  }
}
