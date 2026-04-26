import { x } from 'tinyexec'
import { getRandomPort, waitForPort } from 'get-port-please'
import type { $Fetch, FetchOptions } from 'ofetch'
import { fetch as _fetch, createFetch } from 'ofetch'
import { resolve } from 'pathe'
import { isWindows } from 'std-env'
import { joinURL } from 'ufo'
import { useTestContext } from './context'

const globalFetch = globalThis.fetch || _fetch

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
          ...ctx.options.env,
          ...options.env,
        },
      },
    })
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
            ...ctx.options.env,
            ...options.env,
          },
        },
      },
    )
  }

  await waitForServer({ host, port, dev: ctx.options.dev })
}

interface WaitForServerOptions {
  host: string
  port: number
  dev: boolean
}

async function waitForServer({ host, port, dev }: WaitForServerOptions) {
  const ctx = useTestContext()
  const baseURL = ctx.nuxt?.options.app.baseURL ?? '/'
  const timeout = ctx.options.serverStartTimeout ?? (isWindows ? 120_000 : 60_000)
  const deadline = Date.now() + timeout

  const portRetries = Math.max(1, Math.ceil(timeout / 1000))
  await waitForPort(port, { retries: portRetries, host }).catch(() => {})

  let lastError: unknown
  while (Date.now() < deadline) {
    if (ctx.serverProcess && (ctx.serverProcess.killed || ctx.serverProcess.exitCode != null)) {
      throw new Error(`Server process exited before becoming ready (exit code: ${ctx.serverProcess.exitCode ?? 'unknown'})`)
    }
    try {
      const res = await globalFetch(joinURL(ctx.url!, baseURL), { signal: AbortSignal.timeout(10_000) })
      const body = await res.text()
      // any response means the server is accepting connections.
      // the dev server (`nuxi _dev`) is the one exception: it answers with
      // 503 or a 200 HTML placeholder containing `__NUXT_LOADING__` while the
      // underlying dev server is still starting up.
      if (dev && res.status === 503) {
        lastError = new Error(`Server responded with ${res.status} ${res.statusText}`)
      }
      else if (dev && body.includes('__NUXT_LOADING__')) {
        lastError = new Error('Dev server is still starting up')
      }
      else {
        return
      }
    }
    catch (e) {
      lastError = e
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  await stopServer()
  throw lastError instanceof Error
    ? lastError
    : new Error(`Timeout (${timeout}ms) waiting for ${dev ? 'dev' : 'built'} server to become ready at ${ctx.url}`)
}

export async function stopServer() {
  const ctx = useTestContext()
  if (ctx.serverProcess) {
    ctx.serverProcess.kill()
  }
}

export function fetch(path: string, options?: RequestInit) {
  return globalFetch(url(path), options)
}

const _$fetch = createFetch({ fetch: globalFetch })

export const $fetch = function $fetch(path: string, options?: FetchOptions) {
  return _$fetch(url(path), options)
} as '$fetch' extends keyof typeof globalThis ? typeof globalThis.$fetch : $Fetch

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
