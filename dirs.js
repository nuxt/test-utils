import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const distDir = resolve(dirname(fileURLToPath(import.meta.url)), 'dist')
