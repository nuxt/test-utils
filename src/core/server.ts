import { x } from 'tinyexec'
import { getRandomPort, waitForPort } from 'get-port-please'
import type { FetchOptions } from 'ofetch'
import { $fetch as _$fetch, fetch as _fetch } from 'ofetch'
import { resolve } from 'pathe'
import { joinURL } from 'ufo'
import { useTestContext } from './context'

export interface StartServerOptions {
  env?: Record<string, unknown>
}

export async function startServer(options: StartServerOptions = {}) {
  const ctx = useTestContext()
  await stopServer()
  const host = '127.0.0.1'
  const port = ctx.options.port || (await getRandomPort(host))
  ctx.url = `http://${host}:${port}/`
  if (ctx.options.dev) {
    ctx.serverProcess = x('nuxi', ['_dev'], {
      throwOnError: true,
      nodeOptions: {
        cwd: ctx.nuxt!.options.rootDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          _PORT: String(port), // Used by internal _dev command
          PORT: String(port),
          HOST: host,
          NODE_ENV: 'development',
          ...options.env,
          ...ctx.options.env,
        },
      },
    })
    await waitForPort(port, { retries: 32, host }).catch(() => {})
    let lastError
    for (let i = 0; i < 150; i++) {
      await new Promise(resolve => setTimeout(resolve, 100))
      try {
        const res = await $fetch<string>(ctx.nuxt!.options.app.baseURL, {
          responseType: 'text',
        })
        if (!res.includes('__NUXT_LOADING__')) {
          return
        }
      }
      catch (e) {
        lastError = e
      }
    }
    ctx.serverProcess.kill()
    throw lastError || new Error('Timeout waiting for dev server!')
  }
  else {
    const outputDir = ctx.nuxt ? ctx.nuxt.options.nitro.output!.dir! : ctx.options.nuxtConfig.nitro!.output!.dir!
    ctx.serverProcess = x(
      'node',
      [resolve(outputDir, 'server/index.mjs')],
      {
        throwOnError: true,
        nodeOptions: {
          stdio: 'inherit',
          env: {
            ...process.env,
            PORT: String(port),
            HOST: host,
            NODE_ENV: 'test',
            ...options.env,
            ...ctx.options.env,
          },
        },
      },
    )
    await waitForPort(port, { retries: 20, host })
  }
}

export async function stopServer() {
  const ctx = useTestContext()
  if (ctx.serverProcess) {
    ctx.serverProcess.kill()
  }
}

export function fetch(path: string, options?: RequestInit) {
  return _fetch(url(path), options)
}

export const $fetch = function (path: string, options?: FetchOptions) {
  return _$fetch(url(path), options)
} as (typeof globalThis)['$fetch']

export function url(path: string) {
  const ctx = useTestContext()
  if (!ctx.url) {
    throw new Error('url is not available (is server option enabled?)')
  }
  if (path.startsWith(ctx.url)) {
    return path
  }
  return joinURL(ctx.url, path)
}
