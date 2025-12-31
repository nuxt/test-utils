import type { ChildProcess } from 'node:child_process'

export type VitestTestSummary = {
  failedCount: number
  passedCount: number
  totalCount: number
}

export type SendToHostMessage = {
  started: {
    uiUrl: string | undefined
  }
  updated: VitestTestSummary
  finished: VitestTestSummary
}

export type SendToCliMessage = {
  start: {
    watchMode: boolean
    apiPorts?: number[]
    logToConsole?: boolean
  }
  stop: {
    force?: boolean
  }
}

type ToMessage<T, K extends keyof T> = { type: K, payload: T[K] }
type ToMessages<T> = { [K in keyof T]: ToMessage<T, K> }[keyof T]

function isMessage<T>(message: unknown): message is T {
  return message !== null
    && typeof message === 'object'
    && 'type' in message && message.type !== null && typeof message.type === 'string'
    && 'payload' in message && message.payload !== null && typeof message.payload === 'object'
}

export function createVitestTestSummary(): VitestTestSummary {
  return {
    failedCount: 0,
    passedCount: 0,
    totalCount: 0,
  }
}

export function sendMessageToHost<K extends keyof SendToHostMessage>(
  type: K,
  payload: SendToHostMessage[K],
) {
  process.send?.({ type, payload })
}

export function listenHostMessages(
  listener: (message: ToMessages<SendToCliMessage>) => unknown,
) {
  process.on('message', (message) => {
    if (isMessage<ToMessages<SendToCliMessage>>(message)) {
      listener(message)
    }
  })
}

export function sendMessageToCli<K extends keyof SendToCliMessage>(
  cli: ChildProcess,
  type: K,
  payload: SendToCliMessage[K],
) {
  cli.send({ type, payload })
}

export function listenCliMessages(
  cli: ChildProcess,
  listener: (message: ToMessages<SendToHostMessage>) => unknown,
) {
  cli.on('message', (message) => {
    if (isMessage<ToMessages<SendToHostMessage>>(message)) {
      listener(message)
    }
  })
}
