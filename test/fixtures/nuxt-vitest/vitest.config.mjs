import { defineConfig } from 'vite'
import { getVitestConfig } from '../src'

const viteConfig = await getVitestConfig()

export default defineConfig(viteConfig)
