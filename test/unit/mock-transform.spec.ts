import { beforeEach, describe, expect, it } from 'vitest'
import Module from 'node:module'
import { rollup } from 'rollup'
import type { InputPluginOption } from 'rollup'
import { createMockPlugin } from '../../src/module/plugins/mock'
import type { MockPluginContext } from '../../src/module/plugins/mock'

describe('mocking', () => {
  const pluginContext: MockPluginContext = { imports: [], components: [] }
  const plugin = createMockPlugin(pluginContext)
  const getTransformResult = (code: string) => new Promise<{ code: string, sourcemap: Module.SourceMap }>((resolve, reject) => {
    const input = '/some/file.ts'
    rollup({
      input,
      plugins: [
        {
          name: 'virtual',
          resolveId: id => id === input ? input : { id, external: true },
          load: () => code,
        },
        plugin.vite() as InputPluginOption,
        {
          name: 'resolve',
          transform: {
            order: 'post',
            handler(code, _) {
              const sourcemap = this.getCombinedSourcemap()
              resolve({
                code,
                sourcemap: new Module.SourceMap(sourcemap as unknown as Module.SourceMapPayload),
              })
              // suppress any errors from rollup itself
              return 'export default 42'
            },
          },
        },
      ],
    }).catch(reject)
  })

  const getResult = (code: string) => getTransformResult(code).then(r => r.code)

  beforeEach(() => {
    pluginContext.components = []
    pluginContext.imports = []
  })

  describe('import mocking', () => {
    it('should transform code with mocked imports', async () => {
      pluginContext.imports = [{
        name: 'useSomeExport',
        from: 'bob',
      }]
      const expected = `
        "import {vi} from "vitest";

        vi.hoisted(() => { 
                if(!globalThis.__NUXT_VITEST_MOCKS){
                  vi.stubGlobal("__NUXT_VITEST_MOCKS", {})
                }
              });

        vi.mock("bob", async (importOriginal) => {
          if (!globalThis.__NUXT_VITEST_MOCKS["bob"]) {
            const original = await importOriginal("bob")
            globalThis.__NUXT_VITEST_MOCKS["bob"] = { ...original }
            globalThis.__NUXT_VITEST_MOCKS["bob"].__NUXT_VITEST_MOCKS_ORIGINAL = { ...original }
          }
          globalThis.__NUXT_VITEST_MOCKS["bob"]["useSomeExport"] = await (() => {
                  return () => 'mocked'
                })(globalThis.__NUXT_VITEST_MOCKS["bob"].__NUXT_VITEST_MOCKS_ORIGINAL["useSomeExport"]);
          return globalThis.__NUXT_VITEST_MOCKS["bob"] 
        });

                import { mockNuxtImport } from '@nuxt/test-utils/runtime'
                
              
         import "bob";"
      `
      expect(await getResult(`
        import { mockNuxtImport } from '@nuxt/test-utils/runtime'
        mockNuxtImport('useSomeExport', () => {
          return () => 'mocked'
        })
      `)).toMatchInlineSnapshot(expected)

      expect(await getResult(`
        import { mockNuxtImport } from '@nuxt/test-utils/runtime'
        mockNuxtImport(useSomeExport, () => {
          return () => 'mocked'
        })
      `)).toMatchInlineSnapshot(expected)
    })

    it('should not add `vi` import if it already exists', async () => {
      pluginContext.imports = [{
        name: 'useSomeExport',
        from: 'bob',
      }]
      const source = `
        import { expect, vi, it } from 'vitest'
        mockNuxtImport('useSomeExport', () => 'bob')
        
        it('test', () => {
          const a = vi.fn()
          expect(1).toBe(1)
        })
      `
      const { code, sourcemap } = await getTransformResult(source)
      expect(code).toMatchInlineSnapshot(`
        "
                import { expect, vi, it } from 'vitest'
        vi.hoisted(() => { 
                if(!globalThis.__NUXT_VITEST_MOCKS){
                  vi.stubGlobal("__NUXT_VITEST_MOCKS", {})
                }
              });

        vi.mock("bob", async (importOriginal) => {
          if (!globalThis.__NUXT_VITEST_MOCKS["bob"]) {
            const original = await importOriginal("bob")
            globalThis.__NUXT_VITEST_MOCKS["bob"] = { ...original }
            globalThis.__NUXT_VITEST_MOCKS["bob"].__NUXT_VITEST_MOCKS_ORIGINAL = { ...original }
          }
          globalThis.__NUXT_VITEST_MOCKS["bob"]["useSomeExport"] = await (() => 'bob')(globalThis.__NUXT_VITEST_MOCKS["bob"].__NUXT_VITEST_MOCKS_ORIGINAL["useSomeExport"]);
          return globalThis.__NUXT_VITEST_MOCKS["bob"] 
        });

                
                
                it('test', () => {
                  const a = vi.fn()
                  expect(1).toBe(1)
                })
              
         import "bob";"
      `)
      expect(code).not.toContain('import {vi} from "vitest";')

      expect(code.split('\n')[22]?.substring(10)).toBe('expect(1).toBe(1)')
      expect(source.split('\n')[6]?.substring(10)).toBe('expect(1).toBe(1)')
      expect(sourcemap.findEntry(22, 10)).toMatchObject({
        generatedLine: 22,
        generatedColumn: 10,
        originalLine: 6,
        originalColumn: 10,
        originalSource: '/some/file.ts',
      })
    })
  })

  describe('component mocking', () => {
    it('should work', async () => {
      pluginContext.components = [{
        chunkName: 'Thing',
        export: 'default',
        kebabName: 'thing',
        pascalName: 'Thing',
        prefetch: false,
        preload: false,
        shortPath: 'thing.vue',
        filePath: '/test/thing.vue',
      }]
      const source = `
        import { mockComponent } from '@nuxt/test-utils/runtime'
        mockComponent('MyComponent', () => import('./MockComponent.vue'))

        it('test', () => {
          const a = vi.fn()
          expect(1).toBe(1)
        })
      `
      const { code, sourcemap } = await getTransformResult(source)
      expect(code).toMatchInlineSnapshot(`
        "import {vi} from "vitest";

        vi.hoisted(() => { 
                if(!globalThis.__NUXT_VITEST_MOCKS){
                  vi.stubGlobal("__NUXT_VITEST_MOCKS", {})
                }
              });

        vi.mock("MyComponent", async () => {
          const factory = (() => import('./MockComponent.vue'));
          const result = typeof factory === 'function' ? await factory() : await factory
          return 'default' in result ? result : { default: result }
        });

                import { mockComponent } from '@nuxt/test-utils/runtime'
                

                it('test', () => {
                  const a = vi.fn()
                  expect(1).toBe(1)
                })
              "
      `)

      expect(code.split('\n')[19]?.substring(10)).toBe('expect(1).toBe(1)')
      expect(source.split('\n')[6]?.substring(10)).toBe('expect(1).toBe(1)')
      expect(sourcemap.findEntry(19, 10)).toMatchObject({
        generatedLine: 19,
        generatedColumn: 10,
        originalLine: 6,
        originalColumn: 10,
        originalSource: '/some/file.ts',
      })
    })
  })
})
