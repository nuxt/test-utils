import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'pathe'
import { describe, expect, it } from 'vitest'

import { createVitest } from 'vitest/node'
import type { Vitest } from 'vitest/node'

type VitestCliOptions = Parameters<typeof createVitest>[1]

// Increase timeout for CI environments (especially Windows) where Nuxt build can be slow
const TEST_TIMEOUT = process.env.CI ? 60_000 : 10_000

describe('resolve config', () => {
  describe('simple/env-none', async () => {
    const fixtureDir = '../fixtures/simple/env-none'

    const expected = {
      node: [
        'test/test1.spec.ts',
      ],
      nuxt: [
        'test/test1.nuxt.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)

    it('specific root', async () => {
      expect(await globTestSpecifications('./', {
        root: fixtureDir,
      })).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('simple/env-none-include', async () => {
    const fixtureDir = '../fixtures/simple/env-none-include'

    const expected = {
      node: [
        'test/test1.spec.ts',
      ],
      nuxt: [
        'test/test1.nuxt.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('simple/env-nuxt', async () => {
    const fixtureDir = '../fixtures/simple/env-nuxt'

    const expected = {
      nuxt: [
        'test/test1.nuxt.spec.ts',
        'test/test1.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('simple/env-nuxt-include', async () => {
    const fixtureDir = '../fixtures/simple/env-nuxt-include'

    const expected = {
      nuxt: [
        'test/test1.nuxt.spec.ts',
        'test/test1.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('simple/env-other', () => {
    const fixtureDir = '../fixtures/simple/env-other'

    const expected = {
      nuxt: [
        'test/test1.nuxt.spec.ts',
      ],
      node: [
        'test/test1.spec.ts',
        'test/test2.spec.ts',
        'test/test3.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('simple/env-other-include', () => {
    const fixtureDir = '../fixtures/simple/env-other-include'

    const expected = {
      nuxt: [
        'test/test1.nuxt.spec.ts',
      ],
      node: [
        'test/test1.spec.ts',
        'test/test2.spec.ts',
        'test/test3.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('advised/basic', async () => {
    const fixtureDir = '../fixtures/advised/basic'

    const expected = {
      nuxt: [
        'nuxt-test/test1.spec.ts',
      ],
      unit: [
        'unit-test/test1.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)

    it('specific project', async () => {
      expect(await globTestSpecifications(fixtureDir, {
        project: 'nuxt',
      })).toEqual({ nuxt: expected.nuxt })
    }, TEST_TIMEOUT)

    it('specific root', async () => {
      expect(await globTestSpecifications('./', {
        root: fixtureDir,
      })).toEqual(expected)
    }, TEST_TIMEOUT)
  })

  describe('advised/override', () => {
    const fixtureDir = '../fixtures/advised/override'

    const expected = {
      nuxt1: [
        'test/app/test1.spec.ts',
      ],
      nuxt2: [
        'test/app/test1.spec.ts',
      ],
      unit1: [
        'test/unit/test1.spec.ts',
      ],
      unit2: [
        'test/unit/test1.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications(fixtureDir)).toEqual(expected)
    }, TEST_TIMEOUT)

    it('specific project', async () => {
      expect(await globTestSpecifications(fixtureDir, {
        project: ['nuxt1', 'nuxt2'],
      })).toEqual({
        nuxt1: expected.nuxt1,
        nuxt2: expected.nuxt2,
      })
    }, TEST_TIMEOUT)

    it('specific root', async () => {
      expect(await globTestSpecifications('./', {
        root: fixtureDir,
      })).toEqual(expected)
    }, TEST_TIMEOUT)
  })
})

async function globTestSpecifications(path: string, cliOptions?: VitestCliOptions) {
  const cwd = process.cwd()
  const workdir = fileURLToPath(new URL(path, import.meta.url))

  let vitest: Vitest | undefined

  try {
    process.chdir(workdir)

    vitest = await createVitest('test', {
      ...cliOptions,
      filesOnly: true,
      run: false,
      watch: false,
      cache: false,
    })

    const files = await vitest.globTestSpecifications()
    const result: Record<string, string[]> = {}
    const projectDir = join(vitest.config.root, vitest.config.dir)

    for (const file of files) {
      const project = file.project.name || file.project.config.environment
      const filename = relative(projectDir, file.moduleId)
      result[project] ??= []
      result[project].push(filename)
    }

    for (const key of Object.keys(result)) {
      result[key as keyof typeof result]?.sort()
    }

    return result
  }
  finally {
    try {
      await vitest?.close()
      await rm(join(workdir, '.nuxt'), { recursive: true, force: true })
    }
    finally {
      process.chdir(cwd)
    }
  }
}
