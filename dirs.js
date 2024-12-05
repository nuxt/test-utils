import { fileURLToPath } from 'node:url'
import { dirname } from 'pathe'

export const distDir = dirname(fileURLToPath(new URL('./dist', import.meta.url)))
