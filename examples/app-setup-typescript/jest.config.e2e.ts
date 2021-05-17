import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
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
  preset: '@nuxt/test-utils',
  transform: {
    '\\.ts$': 'ts-jest',
    '\\.vue$': 'vue-jest'
  }
}

export default config
