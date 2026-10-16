import type { TestProject } from 'vitest/node'

export default function setup(project: TestProject) {
  project.provide('testPattern', process.env.ERROR_TEST_PATTERN)
}

declare module 'vitest' {
  export interface ProvidedContext {
    testPattern: string | undefined
  }
}
