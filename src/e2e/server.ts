import { x, xSync } from 'tinyexec'
import { getRandomPort, waitForPort } from 'get-port-please'
import { isWindows } from 'std-env'
import type { $Fetch, FetchOptions } from 'ofetch'
import { fetch as _fetch, createFetch } from 'ofetch'
import { resolve } from 'pathe'
import { joinURL } from 'ufo'
import { useTestContext } from './context.ts'
import type { TestContext } from './types.ts'

const globalFetch = globalThis.fetch || _fetch

/**
 * Per-context promise that resolves once the server subprocess's output has
 * been fully collected into `ctx.serverLogs`. Absent when log capture is off.
 */
const serverLogsCollected = new WeakMap<TestContext, Promise<void>>()

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
  serverLogsCollected.delete(ctx)
  const capture = ctx.options.captureServerLogs !== false
  const stdio = capture ? 'pipe' : 'inherit'
  const logLevel = String(options.logLevel ?? ctx.options.logLevel)
  const startedAt = Date.now()
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
    serverLogsCollected.set(ctx, (async () => {
      for await (const line of ctx.serverProcess!) {
        ctx.serverLogs.push(line)
      }
    })().catch(() => {}))
  }

  await waitForServer({ host, port, startedAt })
}

interface WaitForServerOptions {
  host: string
  port: number
  startedAt: number
}

const REPLAYED_LOG_LINES = 30

// `signalCode` is not part of tinyexec's `Result` surface, so read it off the
// underlying child: a process reaped by an external signal (OOM killer, CI
// runner) reports neither `killed` nor an `exitCode`.
function signalCode(proc: NonNullable<TestContext['serverProcess']>) {
  return proc.process?.signalCode ?? null
}

function hasExited(proc: TestContext['serverProcess']): boolean {
  return !!proc && (proc.killed || proc.exitCode != null || signalCode(proc) !== null)
}

async function flushServerLogs(ctx: TestContext) {
  const collected = serverLogsCollected.get(ctx)
  if (!collected) {
    return
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, 1_000)
  })
  try {
    await Promise.race([collected, timeout])
  }
  finally {
    clearTimeout(timer)
  }
}

function earlyExitError(ctx: TestContext, elapsed: number) {
  const proc = ctx.serverProcess!
  const signal = signalCode(proc)
  const details = [
    // a signalled process has no exit code, and the signal is the whole explanation
    signal ? `signal: ${signal}` : `exit code: ${proc.exitCode ?? 'unknown'}`,
    `killed: ${proc.killed}`,
    `after ${elapsed}ms`,
    `mode: ${ctx.options.dev ? 'dev' : 'built'}`,
  ].join(', ')

  const message = `Server process exited before becoming ready (${details})`
  const output = ctx.serverLogs.slice(-REPLAYED_LOG_LINES).join('\n')

  if (output) {
    return new Error(`${message}\n--- last output from the server process ---\n${output}`)
  }
  if (!serverLogsCollected.has(ctx)) {
    return new Error(`${message}\n(no output captured: \`captureServerLogs\` is disabled)`)
  }
  return new Error(`${message}\n(the server process produced no output)`)
}

async function waitForServer({ host, port, startedAt }: WaitForServerOptions) {
  const ctx = useTestContext()
  const dev = ctx.options.dev
  const baseURL = ctx.nuxt?.options.app.baseURL ?? '/'
  const deadline = Date.now() + ctx.options.serverStartTimeout

  // Brief opportunistic port wait; the fetch loop below owns the real readiness budget.
  await waitForPort(port, { retries: 8, host }).catch(() => {})

  let lastError: unknown
  while (Date.now() < deadline) {
    if (hasExited(ctx.serverProcess)) {
      await flushServerLogs(ctx)
      throw earlyExitError(ctx, Date.now() - startedAt)
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

  // a fetch can hang for 10s, so the process may have died since the last check
  let error: Error
  if (hasExited(ctx.serverProcess)) {
    await flushServerLogs(ctx)
    error = earlyExitError(ctx, Date.now() - startedAt)
  }
  else {
    error = lastError instanceof Error
      ? lastError
      : new Error(`Timeout (${ctx.options.serverStartTimeout}ms) waiting for ${dev ? 'dev' : 'built'} server to become ready at ${ctx.url}`, { cause: lastError })
  }

  await stopServer()
  throw error
}

/**
 * On Windows there are no process groups, and tinyexec routes commands that
 * resolve to a `.cmd` shim (such as `nuxi`) through `cmd.exe /d /s /c`.
 * `taskkill /T /F` walks the tree and terminates the descendants too.
 */
function killProcessTree(pid: number) {
  try {
    xSync('taskkill', ['/pid', String(pid), '/T', '/F'], {
      throwOnError: false,
      nodeOptions: { stdio: 'ignore' },
    })
  }
  catch {
    // taskkill exits non-zero when the process is already gone
  }
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

  const pid = proc.pid
  if (isWindows && pid !== undefined) {
    killProcessTree(pid)
    await Promise.race([exited, sleep(5_000)])
    return
  }

  proc.kill()
  // Wait for the child to actually exit, escalating to SIGKILL if it lingers.
  // Without this, callers can race a still-running server and leave orphan
  // processes holding the port.
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
