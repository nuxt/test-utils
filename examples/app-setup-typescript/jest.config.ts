import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  collectCoverage: true,
  moduleFileExtensions: [
    'ts',
    'js',
    'vue',
    'json'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js'
  },
  transform: {
    '\\.ts$': 'ts-jest',
    '\\.vue$': 'vue-jest'
  }
}

export default config
