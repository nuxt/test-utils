import type { Config } from 'jest'

export default {
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
} satisfies Config
