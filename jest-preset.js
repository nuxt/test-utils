module.exports = {
  collectCoverage: true,
  testEnvironment: 'node',
  transform: {
    '\\.(js|ts)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript'
        ],
        plugins: ['@babel/plugin-transform-runtime']
      }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nuxt-i18n)/)'
  ]
}
