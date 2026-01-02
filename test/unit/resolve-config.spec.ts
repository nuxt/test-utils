import { join, relative } from 'pathe'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { createVitest } from 'vitest/node'
import type { Vitest } from 'vitest/node'

type VitestCliOptions = Parameters<typeof createVitest>[1]

describe('resolve config', () => {
  describe('basic', async () => {
    const expected = {
      node: [
        'test/basic.spec.ts',
      ],
      nuxt: [
        'test/basic.nuxt.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications('../fixtures/basic')).toEqual(expected)
    })

    it('spcific root', async () => {
      expect(await globTestSpecifications('./', {
        root: '../fixtures/basic',
      })).toEqual(expected)
    })
  })

  describe('project', async () => {
    const expected = {
      nuxt: [
        'nuxt-test/project-nuxt.spec.ts',
      ],
      unit: [
        'unit-test/project-unit.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications('../fixtures/project')).toEqual(expected)
    })

    it('only spcific project', async () => {
      expect(await globTestSpecifications('../fixtures/project', {
        project: 'nuxt',
      })).toEqual({ nuxt: expected.nuxt })
    })

    it('spcific root', async () => {
      expect(await globTestSpecifications('./', {
        root: '../fixtures/project',
      })).toEqual(expected)
    })
  })

  describe('override', () => {
    const expected = {
      nuxt1: [
        'test/override.spec.ts',
      ],
      nuxt2: [
        'test/override.spec.ts',
      ],
      unit1: [
        'test/override.spec.ts',
      ],
      unit2: [
        'test/override.spec.ts',
      ],
    } as const

    it('all', async () => {
      expect(await globTestSpecifications('../fixtures/override')).toEqual(expected)
    })

    it('only spcific project', async () => {
      expect(await globTestSpecifications('../fixtures/override', {
        project: ['nuxt1', 'nuxt2'],
      })).toEqual({
        nuxt1: expected.nuxt1,
        nuxt2: expected.nuxt2,
      })
    })

    it('spcific root', async () => {
      expect(await globTestSpecifications('./', {
        root: '../fixtures/override',
      })).toEqual(expected)
    })
  })
})

async function globTestSpecifications(path: string, cliOptions?: VitestCliOptions) {
  const cwd = process.cwd()
  let vitest: Vitest | undefined

  try {
    process.chdir(fileURLToPath(new URL(path, import.meta.url)))

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
      const project = file.project.name
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
    }
    finally {
      process.chdir(cwd)
    }
  }
}
