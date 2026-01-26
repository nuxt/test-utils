import { resolve } from 'pathe'
import { fork } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'

import {
  sendMessageToCli as sendMessage,
  listenCliMessages as listenMessages,
  createVitestTestSummary,
} from './interface'
import type {
  SendToCliMessage as SendMessage,
  SendToHostMessage as RecieveMessage,
} from './interface'

import { distDir } from '#dirs'

type Handlers = {
  [K in keyof RecieveMessage]: ((payload: RecieveMessage[K]) => unknown)[]
} & {
  exited: ((payload: { exitCode: number }) => unknown)[]
}

export type VitestWrapper = ReturnType<typeof vitestWrapper>

export function vitestWrapper(
  options: SendMessage['start'] & { cwd: string },
) {
  const { cwd, ...startOptions } = options

  let _status = 'stopped' as 'stopped' | 'starting' | 'running' | 'finished'
  let _uiUrl: string | undefined
  let _process: ChildProcess | undefined
  let _testSummary = createVitestTestSummary()

  const _handlers: Handlers = {
    started: [({ uiUrl }) => {
      _uiUrl = uiUrl
      _status = 'running'
      _testSummary = createVitestTestSummary()
    }],
    updated: [(summary) => {
      _testSummary = summary
    }],
    finished: [(summary) => {
      _status = 'finished'
      _testSummary = summary
    }],
    exited: [clear],
  }

  function clear() {
    _status = 'stopped'
    _uiUrl = undefined
    _process = undefined
    _testSummary = createVitestTestSummary()
  }

  function on(name: keyof Handlers, handler: NonNullable<Handlers[typeof name]>[number]) {
    _handlers[name] ??= []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _handlers[name]?.push(handler as any)
  }

  function ons(handlers: { [K in keyof Handlers]?: NonNullable<Handlers[K]>[number] }) {
    for (const [name, handler] of Object.entries(handlers)) {
      if (typeof handler === 'function') {
        on(name as keyof Handlers, handler)
      }
    }
  }

  async function stop() {
    const vitest = _process
    if (!vitest || vitest.exitCode !== null) return
    return new Promise<void>((resolve) => {
      vitest.once('exit', () => resolve())
      sendMessage(vitest, 'stop', { force: true })
    })
  }

  async function start() {
    if (_process) return false

    const vitest = fork(resolve(distDir, './vitest-wrapper/cli.mjs'), {
      cwd,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        MODE: 'test',
      },
      stdio: startOptions.logToConsole
        ? undefined
        : ['ignore', 'ignore', 'inherit', 'ipc'],
    })

    _status = 'starting'
    _process = vitest

    vitest.once('exit', () => {
      _handlers.exited.forEach(fn => fn({ exitCode: vitest.exitCode ?? 0 }))
    })

    listenMessages(vitest, ({ type, payload }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _handlers[type].forEach(fn => fn(payload as any))
    })

    sendMessage(vitest, 'start', startOptions)

    return true
  }

  return {
    on,
    ons,
    stop,
    start,
    get uiUrl() {
      return _uiUrl
    },
    get options() {
      return options
    },
    get status() {
      return _status
    },
    get testSummary() {
      return { ..._testSummary }
    },
  }
}
