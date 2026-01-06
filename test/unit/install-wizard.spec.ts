import { describe, expect, it } from 'vitest'
import { parseSync } from 'oxc-parser'
import type { WizardAnswers } from '../../src/module/install-wizard'
import { generateVitestConfig, generatePlaywrightConfig, getDependencies, getPackageScripts, getGitignoreEntries } from '../../src/module/install-wizard'

function validateTypeScriptSyntax(code: string): void {
  expect(() => {
    const result = parseSync('test.ts', code)
    if (result.errors.length > 0) {
      throw new Error(`Parse errors: ${result.errors.map(e => e.message).join(', ')}`)
    }
  }).not.toThrow()
}

describe('install wizard config generation', () => {
  describe('vitest config', () => {
    it('generates config for unit + components with happy-dom', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit', 'components'],
        domEnvironment: 'happy-dom',
        exampleTests: false,
      }

      const config = generateVitestConfig(answers)
      expect(config).toMatchFileSnapshot('__snapshots__/vitest-project-unit-components-happy-dom.ts')
    })

    it('generates config for components with jsdom', () => {
      const answers: WizardAnswers = {
        testingScope: ['components'],
        domEnvironment: 'jsdom',
        exampleTests: false,
      }

      const config = generateVitestConfig(answers)
      expect(config).toMatchFileSnapshot('__snapshots__/vitest-project-components-jsdom.ts')
    })

    it('generates config with browser mode', () => {
      const answers: WizardAnswers = {
        testingScope: ['components'],
        browserMode: true,
        exampleTests: false,
      }

      const config = generateVitestConfig(answers)
      expect(config).toMatchFileSnapshot('__snapshots__/vitest-project-browser.ts')
    })

    it('generates config with coverage', () => {
      const answers: WizardAnswers = {
        testingScope: ['components'],
        domEnvironment: 'happy-dom',
        coverage: true,
        exampleTests: false,
      }

      const config = generateVitestConfig(answers)
      expect(config).toMatchFileSnapshot('__snapshots__/vitest-project-coverage.ts')
    })

    it('generates config with e2e using vitest', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit', 'components', 'e2e'],
        domEnvironment: 'happy-dom',
        e2eRunner: 'vitest',
        exampleTests: false,
      }

      const config = generateVitestConfig(answers)
      expect(config).toMatchFileSnapshot('__snapshots__/vitest-project-with-e2e.ts')
    })

    it('does not include e2e project when using playwright', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit', 'components', 'e2e'],
        domEnvironment: 'happy-dom',
        e2eRunner: 'playwright',
        exampleTests: false,
      }

      const config = generateVitestConfig(answers)
      expect(config).toMatchFileSnapshot('__snapshots__/vitest-project-with-playwright-e2e.ts')
    })
  })

  describe('playwright config', () => {
    it('generates playwright config', () => {
      const config = generatePlaywrightConfig()
      expect(config).toMatchFileSnapshot('__snapshots__/playwright.config.ts')
    })
  })

  describe('dependencies', () => {
    it('includes vitest and test-utils for unit tests', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit'],
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('vitest')
      expect(deps).toContain('@vue/test-utils')
    })

    it('includes dom environment for components', () => {
      const answers: WizardAnswers = {
        testingScope: ['components'],
        domEnvironment: 'happy-dom',
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('vitest')
      expect(deps).toContain('@vue/test-utils')
      expect(deps).toContain('happy-dom')
    })

    it('includes browser-playwright for browser mode', () => {
      const answers: WizardAnswers = {
        testingScope: ['components'],
        browserMode: true,
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('vitest')
      expect(deps).toContain('@vue/test-utils')
      expect(deps).toContain('@vitest/browser-playwright')
      expect(deps).not.toContain('happy-dom')
      expect(deps).not.toContain('jsdom')
    })

    it('includes playwright for e2e with playwright', () => {
      const answers: WizardAnswers = {
        testingScope: ['e2e'],
        e2eRunner: 'playwright',
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('@playwright/test')
      expect(deps).toContain('playwright-core')
    })

    it('includes cucumber for e2e with cucumber', () => {
      const answers: WizardAnswers = {
        testingScope: ['e2e'],
        e2eRunner: 'cucumber',
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('@cucumber/cucumber')
    })

    it('includes jest for e2e with jest', () => {
      const answers: WizardAnswers = {
        testingScope: ['e2e'],
        e2eRunner: 'jest',
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('@jest/globals')
    })

    it('includes coverage when enabled', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit'],
        coverage: true,
        exampleTests: false,
      }

      const deps = getDependencies(answers)

      expect(deps).toContain('vitest')
      expect(deps).toContain('@vitest/coverage-v8')
    })
  })

  describe('package.json scripts', () => {
    it('adds basic vitest scripts', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit'],
        exampleTests: false,
      }

      const scripts = getPackageScripts(answers)

      expect(scripts.test).toBe('vitest')
      expect(scripts['test:watch']).toBe('vitest --watch')
      expect(scripts['test:unit']).toBe('vitest --project unit')
    })

    it('adds coverage script when enabled', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit'],
        coverage: true,
        exampleTests: false,
      }

      const scripts = getPackageScripts(answers)

      expect(scripts['test:coverage']).toBe('vitest --coverage')
    })

    it('adds project scripts', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit', 'components'],
        domEnvironment: 'happy-dom',
        exampleTests: false,
      }

      const scripts = getPackageScripts(answers)

      expect(scripts['test:unit']).toBe('vitest --project unit')
      expect(scripts['test:nuxt']).toBe('vitest --project nuxt')
    })

    it('adds e2e script for vitest e2e', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit', 'e2e'],
        e2eRunner: 'vitest',
        exampleTests: false,
      }

      const scripts = getPackageScripts(answers)

      expect(scripts['test:e2e']).toBe('vitest --project e2e')
    })

    it('adds playwright scripts for playwright e2e', () => {
      const answers: WizardAnswers = {
        testingScope: ['e2e'],
        e2eRunner: 'playwright',
        exampleTests: false,
      }

      const scripts = getPackageScripts(answers)

      expect(scripts['test:e2e']).toBe('playwright test')
      expect(scripts['test:e2e:ui']).toBe('playwright test --ui')
    })
  })

  describe('gitignore entries', () => {
    it('includes coverage directory when coverage enabled', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit'],
        coverage: true,
        exampleTests: false,
      }

      const entries = getGitignoreEntries(answers)

      expect(entries).toContain('coverage/')
    })

    it('includes playwright directories when using playwright', () => {
      const answers: WizardAnswers = {
        testingScope: ['e2e'],
        e2eRunner: 'playwright',
        exampleTests: false,
      }

      const entries = getGitignoreEntries(answers)

      expect(entries).toContain('playwright-report/')
      expect(entries).toContain('test-results/')
    })

    it('does not include playwright directories when not using playwright', () => {
      const answers: WizardAnswers = {
        testingScope: ['unit'],
        exampleTests: false,
      }

      const entries = getGitignoreEntries(answers)

      expect(entries).not.toContain('playwright-report/')
      expect(entries).not.toContain('test-results/')
    })
  })

  describe('config syntax validation', () => {
    it('generates valid JavaScript for all vitest config permutations', () => {
      const permutations: WizardAnswers[] = [
        { testingScope: ['unit', 'components'], domEnvironment: 'happy-dom', exampleTests: false },
        { testingScope: ['unit', 'components'], domEnvironment: 'jsdom', exampleTests: false },
        { testingScope: ['components'], browserMode: true, exampleTests: false },
        { testingScope: ['unit', 'components', 'e2e'], domEnvironment: 'happy-dom', e2eRunner: 'vitest', exampleTests: false },
        { testingScope: ['components'], domEnvironment: 'happy-dom', coverage: true, exampleTests: false },
        { testingScope: ['unit'], exampleTests: false },
        { testingScope: ['components'], browserMode: true, coverage: true, exampleTests: false },
      ]

      for (const answers of permutations) {
        const config = generateVitestConfig(answers)
        validateTypeScriptSyntax(config)
      }
    })

    it('generates valid TypeScript for playwright config', () => {
      const config = generatePlaywrightConfig()
      validateTypeScriptSyntax(config)
    })
  })
})
