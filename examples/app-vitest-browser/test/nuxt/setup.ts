import { vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport(useCounter, vi.fn)
mockNuxtImport(useHelloApi, vi.fn)
