module.exports = {
  preset: './jest-preset.js',
  collectCoverageFrom: ['src/**/*.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/examples/'
  ]
}
