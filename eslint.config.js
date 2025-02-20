// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './examples/app-cucumber',
      './examples/app-jest',
      './examples/app-playwright',
      './examples/app-vitest',
      './examples/app-vitest-full',
      './examples/content',
      './examples/i18n',
      './examples/module',
    ],
  },
}).append({
  rules: {
    '@typescript-eslint/no-invalid-void-type': 'off',
    'vue/multi-word-component-names': 'off',
  },
})
