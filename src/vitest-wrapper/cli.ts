import type { Vitest, Reporter } from 'vitest/node'
import { importModule } from 'local-pkg'
import { getPort } from 'get-port-please'

import {
  sendMessageToHost as sendMessage,
  listenHostMessages as listenMessages,
} from './interface'
import type {
  SendToCliMessage as RecieveMessage,
  SendToHostMessage as SendMessage,
} from './interface'

function createCustomReporter(onVitestInit: (ctx: Vitest) => unknown): Reporter {
  let ctx: Vitest = undefined!

  function getVitestUiUrl() {
    if (!ctx.config.ui) return undefined
    const protocol = ctx.vite.config.server.https ? 'https:' : 'http:'
    const host = ctx.config.api.host || 'localhost'
    const port = ctx.config.api.port
    const uiBase = ctx.config.uiBase
    return `${protocol}//${host}:${port}${uiBase}`
  }

  function toUpdatedResult(): SendMessage['updated'] {
    const files = ctx.state.getFiles()
    return {
      failedCount: files.filter(f => f.result?.state === 'fail').length ?? 0,
      passedCount: files.filter(f => f.result?.state === 'pass').length ?? 0,
      totalCount: files.length ?? 0,
    }
  }

  function toFinishedResult(): SendMessage['finished'] {
    return toUpdatedResult()
  }

  return {
    onInit(_ctx) {
      ctx = _ctx
      onVitestInit(ctx)
      sendMessage('started', { uiUrl: getVitestUiUrl() })
    },

    onTestRunStart() {
      sendMessage('updated', toUpdatedResult())
    },

    onTaskUpdate() {
      sendMessage('updated', toUpdatedResult())
    },

    onFinished() {
      sendMessage('finished', toFinishedResult())
    },
  }
}

async function main() {
  const {
    apiPorts,
    watchMode,
  } = await new Promise<RecieveMessage['start']>((resolve) => {
    listenMessages(({ type, payload }) => {
      if (type === 'start') resolve(payload)
    })
  })

  const port = apiPorts ? await getPort({ ports: apiPorts }) : undefined

  const { startVitest } = await importModule<typeof import('vitest/node')>('vitest/node')

  const customReporter = createCustomReporter((vitest) => {
    listenMessages(async ({ type, payload }) => {
      if (type === 'stop') {
        await vitest.exit(payload.force)
        process.exit()
      }
    })
  })

  const vitest = await startVitest('test', [], watchMode
    ? {
        passWithNoTests: true,
        ui: true,
        watch: true,
        open: false,
        api: { port },
      }
    : { ui: false, watch: false }, {
    test: {
      reporters: ['default', customReporter],
    },
  })

  if (!watchMode) {
    await vitest.exit()
    process.exit()
  }
}

main()
