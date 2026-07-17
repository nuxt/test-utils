import { x } from 'tinyexec'
import { getRandomPort, waitForPort } from 'get-port-please'
import type { $Fetch, FetchOptions } from 'ofetch'
import { fetch as _fetch, createFetch } from 'ofetch'
import { resolve } from 'pathe'
import { joinURL } from 'ufo'
import { useTestContext } from './context.ts'

const globalFetch = globalThis.fetch || _fetch

export interface StartServerOptions {
  env?: Record<string, unknown>
  /**
   * Overrides the consola log level for the server subprocess.
   * Defaults to `TestOptions.logLevel` (which itself defaults to `1`).
   */
  logLevel?: number
}

export async function startServer(options: StartServerOptions = {}) {
  const ctx = useTestContext()
  await stopServer()
  ctx.serverLogs = []
  const host = '127.0.0.1'
  const port = ctx.options.port || (await getRandomPort(host))
  ctx.url = `http://${host}:${port}/`
  const capture = ctx.options.captureServerLogs !== false
  const stdio = capture ? 'pipe' : 'inherit'
  const logLevel = String(options.logLevel ?? ctx.options.logLevel)
  if (ctx.options.dev) {
    ctx.serverProcess = x('nuxi', ['_dev'], {
      throwOnError: true,
      nodeOptions: {
        cwd: ctx.nuxt!.options.rootDir,
        stdio,
        env: {
          ...process.env,
          _PORT: String(port), // Used by internal _dev command
          PORT: String(port),
          HOST: host,
          NODE_ENV: 'development',
          CONSOLA_LEVEL: logLevel,
          ...ctx.options.env,
          ...options.env,
        },
      },
    })
  }
  else {
    // The `nitro` property is augmented onto NuxtOptions/NuxtConfig by
    // `@nuxt/nitro-server`, which isn't a direct dependency.
    type WithNitroOutput = { nitro?: { output?: { dir?: string } } }
    const outputDir = ctx.nuxt
      ? (ctx.nuxt.options as WithNitroOutput).nitro!.output!.dir!
      : (ctx.options.nuxtConfig as WithNitroOutput).nitro!.output!.dir!
    ctx.serverProcess = x(
      'node',
      [resolve(outputDir, 'server/index.mjs')],
      {
        throwOnError: true,
        nodeOptions: {
          stdio,
          env: {
            ...process.env,
            PORT: String(port),
            HOST: host,
            NODE_ENV: 'test',
            CONSOLA_LEVEL: logLevel,
            ...ctx.options.env,
            ...options.env,
          },
        },
      },
    )
  }

  if (capture) {
    ;(async () => {
      for await (const line of ctx.serverProcess!) {
        ctx.serverLogs.push(line)
      }
    })().catch(() => {})
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
  const deadline = Date.now() + ctx.options.serverStartTimeout

  // Brief opportunistic port wait; the fetch loop below owns the real readiness budget.
  await waitForPort(port, { retries: 8, host }).catch(() => {})

  let lastError: unknown
  while (Date.now() < deadline) {
    if (ctx.serverProcess && (ctx.serverProcess.killed || ctx.serverProcess.exitCode != null)) {
      throw new Error(`Server process exited before becoming ready (exit code: ${ctx.serverProcess.exitCode ?? 'unknown'})`)
    }
    try {
      const res = await globalFetch(joinURL(ctx.url!, baseURL), { signal: AbortSignal.timeout(10_000) })
      // any response means the server is accepting connections.
      // the dev server (`nuxi _dev`) is the one exception: it answers with
      // 503 or a 200 HTML placeholder containing `__NUXT_LOADING__` while the
      // underlying dev server is still starting up.
      if (dev && res.status === 503) {
        lastError = new Error(`Server responded with ${res.status} ${res.statusText}`)
      }
      else if (dev && (await res.text()).includes('__NUXT_LOADING__')) {
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
    : new Error(`Timeout (${ctx.options.serverStartTimeout}ms) waiting for ${dev ? 'dev' : 'built'} server to become ready at ${ctx.url}`)
}

export async function stopServer() {
  const ctx = useTestContext()
  const proc = ctx.serverProcess
  if (!proc) {
    return
  }
  ctx.serverProcess = undefined

  // tinyexec resolves the process when it exits; swallow non-zero exits since
  // we're killing it on purpose.
  const exited = Promise.resolve(proc).then(() => {}, () => {})
  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  proc.kill()
  // Wait for the child to actually exit, escalating to SIGKILL if it lingers.
  // Without this, callers can race a still-running server and (on Windows
  // especially) leave orphan processes holding the port.
  await Promise.race([exited, sleep(5_000)])
  if (proc.exitCode == null) {
    proc.kill('SIGKILL')
    await Promise.race([exited, sleep(5_000)])
  }
}

/**
 * Returns the lines captured from the server subprocess's stdout/stderr since
 * the last `startServer()` call (or `clearServerLogs()`).
 * Only populated when `captureServerLogs` is `true` (the default).
 */
export function getServerLogs(): string[] {
  return useTestContext().serverLogs
}

/**
 * Clears the captured server log lines. Useful between requests when you want
 * to assert only on the logs produced by a specific operation.
 */
export function clearServerLogs(): void {
  useTestContext().serverLogs = []
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
