module.exports = {
  moduleFileExtensions: [
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
    '\\.js$': 'babel-jest',
    '\\.vue$': 'vue-jest'
  }
}
