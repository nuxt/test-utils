module.exports = {
  collectCoverage: true,
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
  transform: {
    '\\.js$': 'babel-jest',
    '\\.vue$': 'vue-jest'
  }
}
