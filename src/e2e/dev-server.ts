import process from 'node:process'
import { pathToFileURL } from 'node:url'

interface NuxtCli {
  runCommand: (name: string, argv?: string[], data?: { overrides?: Record<string, unknown> }) => Promise<unknown>
}

const overrides = JSON.parse(process.env.__NUXT_TEST_DEV_OVERRIDES__ || '{}')
delete process.env.__NUXT_TEST_DEV_OVERRIDES__

process.on('unhandledRejection', err => console.error('[unhandledRejection]', err))
process.on('uncaughtException', err => console.error('[uncaughtException]', err))

const { runCommand }: NuxtCli = await import(pathToFileURL(process.argv[2]!).href)
await runCommand('_dev', [], { overrides })
