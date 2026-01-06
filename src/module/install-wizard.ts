import type { Nuxt } from '@nuxt/schema'
import { existsSync, promises as fsp } from 'node:fs'
import process from 'node:process'
import { cancel, confirm, intro, isCancel, multiselect, outro, select } from '@clack/prompts'
import { colors } from 'consola/utils'
import { logger } from '@nuxt/kit'
import { join, relative } from 'pathe'
import { addDependency, detectPackageManager } from 'nypm'
import { isCI, hasTTY } from 'std-env'

export interface WizardAnswers {
  testingScope: Array<'unit' | 'components' | 'e2e'>
  domEnvironment?: 'happy-dom' | 'jsdom'
  e2eRunner?: 'playwright' | 'vitest' | 'cucumber' | 'jest'
  browserMode?: boolean
  coverage?: boolean
  exampleTests?: boolean
}

export function generateVitestConfig(answers: WizardAnswers): string {
  let config = `import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'`

  if (answers.browserMode) {
    config += `
import { playwright } from '@vitest/browser-playwright'`
  }

  config += `

export default defineConfig({\n`

  config += `  test: {
    projects: [\n`

  if (answers.testingScope.includes('unit')) {
    config += `      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },\n`
  }

  config += `      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(new URL('.', import.meta.url)),${answers.browserMode ? '' : `\n              domEnvironment: '${answers.domEnvironment || 'happy-dom'}',`}
            },
          },${answers.browserMode ? `\n          browser: {\n            enabled: true,\n            provider: playwright(),\n            instances: [\n              { browser: 'chromium' },\n            ],\n          },` : ''}
        },
      }),\n`

  if (answers.testingScope.includes('e2e') && answers.e2eRunner === 'vitest') {
    config += `      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node',
        },
      },\n`
  }

  config += `    ],\n`

  if (answers.coverage) {
    config += `    coverage: {
      enabled: true,
      provider: 'v8',
    },\n`
  }

  config += `  },\n`

  config += `})\n`

  return config
}

export function generatePlaywrightConfig(): string {
  return `import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
`
}

export function getDependencies(answers: WizardAnswers): string[] {
  const dependencies: string[] = []

  if (answers.testingScope.includes('unit') || answers.testingScope.includes('components')) {
    dependencies.push('vitest', '@vue/test-utils')

    if (answers.domEnvironment) {
      dependencies.push(answers.domEnvironment)
    }

    if (answers.browserMode) {
      dependencies.push('@vitest/browser-playwright')
    }
  }

  if (answers.e2eRunner === 'playwright') {
    dependencies.push('@playwright/test', 'playwright-core')
  }
  else if (answers.e2eRunner === 'cucumber') {
    dependencies.push('@cucumber/cucumber')
  }
  else if (answers.e2eRunner === 'jest') {
    dependencies.push('@jest/globals')
  }

  if (answers.coverage) {
    dependencies.push('@vitest/coverage-v8')
  }

  return dependencies
}

export function getPackageScripts(answers: WizardAnswers): Record<string, string> {
  const scripts: Record<string, string> = {}

  if (answers.testingScope.includes('unit') || answers.testingScope.includes('components')) {
    scripts.test = 'vitest'
    scripts['test:watch'] = 'vitest --watch'

    if (answers.coverage) {
      scripts['test:coverage'] = 'vitest --coverage'
    }

    if (answers.testingScope.includes('unit')) {
      scripts['test:unit'] = 'vitest --project unit'
    }
    scripts['test:nuxt'] = 'vitest --project nuxt'
    if (answers.testingScope.includes('e2e') && answers.e2eRunner === 'vitest') {
      scripts['test:e2e'] = 'vitest --project e2e'
    }
  }

  if (answers.e2eRunner === 'playwright') {
    scripts['test:e2e'] = 'playwright test'
    scripts['test:e2e:ui'] = 'playwright test --ui'
  }

  return scripts
}

export function getGitignoreEntries(answers: WizardAnswers): string[] {
  const entries: string[] = []

  if (answers.coverage) {
    entries.push('coverage/')
  }

  if (answers.e2eRunner === 'playwright') {
    entries.push('playwright-report/', 'test-results/')
  }

  return entries
}

export async function runInstallWizard(nuxt: Nuxt): Promise<void> {
  if (isCI || !hasTTY || nuxt.options.test) {
    return
  }

  // TODO: support automatic setup in monorepos
  if (nuxt.options.workspaceDir && nuxt.options.workspaceDir !== nuxt.options.rootDir) {
    logger.info('Monorepo detected. Skipping setup wizard.')
    return
  }

  // Check if config already exists
  const rootDir = nuxt.options.rootDir
  const hasVitestConfig = existsSync(join(rootDir, 'vitest.config.ts'))
    || existsSync(join(rootDir, 'vitest.config.js'))
    || existsSync(join(rootDir, 'vitest.config.mts'))
    || existsSync(join(rootDir, 'vitest.config.mjs'))
  const hasPlaywrightConfig = existsSync(join(rootDir, 'playwright.config.ts'))
    || existsSync(join(rootDir, 'playwright.config.js'))

  if (hasVitestConfig || hasPlaywrightConfig) {
    logger.info('Test configuration already exists. Skipping setup wizard.')
    return
  }

  intro(colors.bold(colors.cyan('🧪 Nuxt Test Utils Setup')))

  const answers: WizardAnswers = {} as WizardAnswers

  // Step 1: Testing scope
  const testingScope = await multiselect({
    message: 'What kind of tests will you need?',
    options: [
      {
        value: 'components' as const,
        label: 'Components',
        hint: 'components or composables running in a Nuxt runtime environment',
      },
      {
        value: 'unit' as const,
        label: 'Unit tests',
        hint: 'utilities that do not require a Nuxt runtime environment',
      },
      {
        value: 'e2e' as const,
        label: 'End-to-end',
        hint: 'full application flows in browser',
      },
    ],
    required: true,
  })

  if (isCancel(testingScope)) {
    cancel('Setup cancelled.')
    process.exit(0)
  }

  answers.testingScope = testingScope

  const needsVitest = answers.testingScope.includes('unit') || answers.testingScope.includes('components')
  const needsE2E = answers.testingScope.includes('e2e')

  // Step 2: DOM environment (if components selected)
  if (answers.testingScope.includes('components')) {
    const domEnvironment = await select({
      message: 'Which DOM environment would you like to use for component tests?',
      options: [
        {
          value: 'happy-dom' as const,
          label: 'happy-dom',
          hint: 'recommended - faster, lighter',
        },
        {
          value: 'jsdom' as const,
          label: 'jsdom',
          hint: 'more complete browser simulation',
        },
        {
          value: 'browser' as const,
          label: 'Browser mode',
          hint: 'real browser with Playwright',
        },
      ],
      initialValue: 'happy-dom' as const,
    })

    if (isCancel(domEnvironment)) {
      cancel('Setup cancelled.')
      process.exit(0)
    }

    if (domEnvironment === 'browser') {
      answers.browserMode = true
    }
    else {
      answers.domEnvironment = domEnvironment
    }
  }

  // Step 3: E2E runner (if e2e selected)
  if (needsE2E) {
    const e2eRunner = await select({
      message: 'Which end-to-end test runner would you like to use?',
      options: [
        {
          value: 'playwright' as const,
          label: 'Playwright',
          hint: 'recommended - modern, multi-browser',
        },
        {
          value: 'vitest' as const,
          label: 'Vitest',
          hint: 'same runner as unit tests',
        },
        {
          value: 'cucumber' as const,
          label: 'Cucumber',
          hint: 'behavior-driven development',
        },
        {
          value: 'jest' as const,
          label: 'Jest',
          hint: 'legacy test runner',
        },
      ],
      initialValue: 'playwright' as const,
    })

    if (isCancel(e2eRunner)) {
      cancel('Setup cancelled.')
      process.exit(0)
    }

    answers.e2eRunner = e2eRunner
  }

  // Step 4: Coverage
  if (needsVitest) {
    const coverage = await confirm({
      message: 'Would you like to set up test coverage?',
      initialValue: false,
    })

    if (isCancel(coverage)) {
      cancel('Setup cancelled.')
      process.exit(0)
    }

    answers.coverage = coverage
  }

  // Step 5: Example tests
  const exampleTests = await confirm({
    message: 'Create example test files?',
    initialValue: true,
  })

  if (isCancel(exampleTests)) {
    cancel('Setup cancelled.')
    process.exit(0)
  }

  answers.exampleTests = exampleTests

  // Now perform the setup
  await performSetup(nuxt, answers)

  outro(colors.green('✨ Test setup complete!'))
}

async function performSetup(nuxt: Nuxt, answers: WizardAnswers): Promise<void> {
  const rootDir = nuxt.options.rootDir
  const packageManager = await detectPackageManager(rootDir)

  logger.info('Installing dependencies...')

  // Install dependencies based on choices
  const dependencies = getDependencies(answers)

  // Install all dependencies
  if (dependencies.length > 0) {
    try {
      await addDependency(dependencies, {
        cwd: rootDir,
        dev: true,
        packageManager,
      })
    }
    catch (error: unknown) {
      logger.error('Failed to install dependencies:', error)
      return
    }
  }

  // Create config files
  if (answers.testingScope.includes('unit') || answers.testingScope.includes('components')) {
    await createVitestConfig(nuxt, answers)
  }

  if (answers.e2eRunner === 'playwright') {
    await createPlaywrightConfig(nuxt)
  }

  // Create test directories
  await createTestDirectories(nuxt, answers)

  // Create example tests
  if (answers.exampleTests) {
    await createExampleTests(nuxt, answers)
  }

  // Update package.json scripts
  await updatePackageScripts(nuxt, answers)

  // Update .gitignore
  await updateGitignore(nuxt, answers)
}

async function createVitestConfig(nuxt: Nuxt, answers: WizardAnswers): Promise<void> {
  const rootDir = nuxt.options.rootDir
  const configPath = join(rootDir, 'vitest.config.ts')
  const config = generateVitestConfig(answers)
  await fsp.writeFile(configPath, config, 'utf-8')
  logger.success(`Created ${colors.cyan(relative(process.cwd(), configPath))}`)
}

async function createPlaywrightConfig(nuxt: Nuxt): Promise<void> {
  const rootDir = nuxt.options.rootDir
  const configPath = join(rootDir, 'playwright.config.ts')
  const config = generatePlaywrightConfig()
  await fsp.writeFile(configPath, config, 'utf-8')
  logger.success(`Created ${colors.cyan(relative(process.cwd(), configPath))}`)
}

async function createTestDirectories(nuxt: Nuxt, answers: WizardAnswers): Promise<void> {
  const rootDir = nuxt.options.rootDir

  if (answers.testingScope.includes('unit')) {
    const unitDir = join(rootDir, 'test/unit')
    await fsp.mkdir(unitDir, { recursive: true })
    logger.success(`Created ${colors.cyan(relative(process.cwd(), unitDir))}`)
  }

  if (answers.testingScope.includes('components')) {
    const nuxtDir = join(rootDir, 'test/nuxt')
    await fsp.mkdir(nuxtDir, { recursive: true })
    logger.success(`Created ${colors.cyan(relative(process.cwd(), nuxtDir))}`)
  }

  if (answers.testingScope.includes('e2e')) {
    const e2eDir = answers.e2eRunner === 'playwright'
      ? join(rootDir, 'tests')
      : join(rootDir, 'test/e2e')
    await fsp.mkdir(e2eDir, { recursive: true })
    logger.success(`Created ${colors.cyan(relative(process.cwd(), e2eDir))}`)
  }
}

async function createExampleTests(nuxt: Nuxt, answers: WizardAnswers): Promise<void> {
  const rootDir = nuxt.options.rootDir

  // Unit test example
  if (answers.testingScope.includes('unit')) {
    const unitTestPath = join(rootDir, 'test/unit/example.test.ts')
    const unitTest = `import { describe, expect, it } from 'vitest'

describe('example unit test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
`
    await fsp.writeFile(unitTestPath, unitTest, 'utf-8')
    logger.success(`Created ${colors.cyan(relative(process.cwd(), unitTestPath))}`)
  }

  // Component test example
  if (answers.testingScope.includes('components')) {
    const componentTestPath = join(rootDir, 'test/nuxt/component.test.ts')
    const componentTest = `import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'

describe('component test example', () => {
  it('can mount components', async () => {
    const TestComponent = defineComponent({
      setup() {
        return () => h('div', 'Hello Nuxt!')
      },
    })
    
    const component = await mountSuspended(TestComponent)
    
    expect(component.text()).toBe('Hello Nuxt!')
  })
})
`
    await fsp.writeFile(componentTestPath, componentTest, 'utf-8')
    logger.success(`Created ${colors.cyan(relative(process.cwd(), componentTestPath))}`)
  }

  // E2E test example
  if (answers.testingScope.includes('e2e')) {
    if (answers.e2eRunner === 'playwright') {
      const e2eTestPath = join(rootDir, 'tests/example.spec.ts')
      const e2eTest = `import { expect, test } from '@nuxt/test-utils/playwright'

test('example e2e test', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page).toHaveTitle(/Nuxt/)
})
`
      await fsp.writeFile(e2eTestPath, e2eTest, 'utf-8')
      logger.success(`Created ${colors.cyan(relative(process.cwd(), e2eTestPath))}`)
    }
    else {
      const e2eTestPath = join(rootDir, 'test/e2e/example.test.ts')
      const e2eTest = `import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('example e2e test', async () => {
  await setup()

  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Nuxt')
  })
})
`
      await fsp.writeFile(e2eTestPath, e2eTest, 'utf-8')
      logger.success(`Created ${colors.cyan(relative(process.cwd(), e2eTestPath))}`)
    }
  }
}

async function updatePackageScripts(nuxt: Nuxt, answers: WizardAnswers): Promise<void> {
  const rootDir = nuxt.options.rootDir
  const packageJsonPath = join(rootDir, 'package.json')

  const packageJson = JSON.parse(await fsp.readFile(packageJsonPath, 'utf-8'))
  packageJson.scripts = packageJson.scripts || {}

  const newScripts = getPackageScripts(answers)
  Object.assign(packageJson.scripts, newScripts)

  await fsp.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8')
  logger.success('Updated package.json scripts')
}

async function updateGitignore(nuxt: Nuxt, answers: WizardAnswers): Promise<void> {
  const rootDir = nuxt.options.rootDir
  const gitignorePath = join(rootDir, '.gitignore')

  let gitignore = ''
  if (existsSync(gitignorePath)) {
    gitignore = await fsp.readFile(gitignorePath, 'utf-8')
  }

  const lines: string[] = []

  if (answers.coverage && !gitignore.includes('coverage')) {
    lines.push('# Test coverage', 'coverage/', '')
  }

  if (answers.e2eRunner === 'playwright') {
    if (!gitignore.includes('playwright-report')) {
      lines.push('# Playwright', 'playwright-report/', 'test-results/', '')
    }
  }

  if (lines.length > 0) {
    gitignore += '\n' + lines.join('\n')
    await fsp.writeFile(gitignorePath, gitignore, 'utf-8')
    logger.success('Updated .gitignore')
  }
}
