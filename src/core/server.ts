import { execa } from 'execa'
import { getRandomPort, waitForPort } from 'get-port-please'
import type { FetchOptions } from 'ofetch'
import { $fetch as _$fetch, fetch as _fetch } from 'ofetch'
import * as _kit from '@nuxt/kit'
import { resolve } from 'pathe'

import { useTestContext } from './context'

// @ts-expect-error type cast kit default export
const kit: typeof _kit = _kit.default || _kit

export interface StartServerOptions {
  env?: Record<string, unknown>
}

export async function reuseExistingServer() {
  const ctx = useTestContext()
  const host = ctx.options.host || 'localhost' // Default to localhost since it's the host used by nuxt dev server
  const port = ctx.options.port || 3000 // Default to 3000 since it's the port used by nuxt dev server

  if (port === undefined) {
    throw new Error('Port is required when reusing server')
  }

  ctx.url = `http://${host}:${port}`
}

export async function startServer(options: StartServerOptions = {}) {
  const ctx = useTestContext()
  await stopServer()
  const host = '127.0.0.1'
  const port = ctx.options.port || (await getRandomPort(host))
  ctx.url = `http://${host}:${port}`
  if (ctx.options.dev) {
    const nuxiCLI = await kit.resolvePath('nuxi/cli')
    ctx.serverProcess = execa(nuxiCLI, ['_dev'], {
      cwd: ctx.nuxt!.options.rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        _PORT: String(port), // Used by internal _dev command
        PORT: String(port),
        HOST: host,
        NODE_ENV: 'development',
        ...options.env,
      },
    })
    await waitForPort(port, { retries: 32, host }).catch(() => {})
    let lastError
    for (let i = 0; i < 150; i++) {
      await new Promise(resolve => setTimeout(resolve, 100))
      try {
        const res = await $fetch<string>(ctx.nuxt!.options.app.baseURL, { responseType: 'text' })
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
    ctx.serverProcess = execa('node', [
      resolve(ctx.nuxt!.options.nitro.output!.dir!, 'server/index.mjs')
    ], {
        stdio: 'inherit',
        env: {
          ...process.env,
          PORT: String(port),
          HOST: host,
          NODE_ENV: 'test',
          ...options.env,
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
} as typeof globalThis['$fetch']

export function url(path: string) {
  const ctx = useTestContext()
  if (!ctx.url) {
    throw new Error('url is not available (is server option enabled?)')
  }
  if (path.startsWith(ctx.url)) {
    return path
  }
  return ctx.url + path
}
