import { beforeEach, describe, expect, it } from 'vitest'
import { rollup } from 'rollup'
import { type MockPluginContext, createMockPlugin } from '../../src/module/plugins/mock'

describe('mocking', () => {
  const pluginContext: MockPluginContext = { imports: [], components: [] }
  const plugin = createMockPlugin(pluginContext)
  const getResult = (code: string) => new Promise<string>((resolve) => {
    const input = '/some/file.ts'
    rollup({
      input,
      plugins: [
        {
          name: 'virtual',
          resolveId: id => id === input ? input : { id, external: true },
          load: () => code,
        },
        plugin.vite(),
        {
          name: 'resolve',
          transform: {
            order: 'post',
            handler: (code) => {
              resolve(code)
              // suppress any errors from rollup itself
              return 'export default 42'
            },
          },
        },
      ],
    })
  })

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
      expect(await getResult(`
        import { mockNuxtImport } from '@nuxt/test-utils/runtime'
        mockNuxtImport('useSomeExport', () => {
          return () => 'mocked'
        })
      `)).toMatchInlineSnapshot(`
        "import {vi} from "vitest";

        vi.hoisted(() => { 
                if(!globalThis.__NUXT_VITEST_MOCKS){
                  vi.stubGlobal("__NUXT_VITEST_MOCKS", {})
                }
              });

        vi.mock("bob", async (importOriginal) => {
          const mocks = globalThis.__NUXT_VITEST_MOCKS
          if (!mocks["bob"]) {
            mocks["bob"] = { ...await importOriginal("bob") }
          }
          mocks["bob"]["useSomeExport"] = await (() => {
                  return () => 'mocked'
                })();
          return mocks["bob"] 
        });

                import { mockNuxtImport } from '@nuxt/test-utils/runtime'
                
              
         import "bob";"
      `)
    })
    it('should not add `vi` import if it already exists', async () => {
      pluginContext.imports = [{
        name: 'useSomeExport',
        from: 'bob',
      }]
      const code = await getResult(`
        import { expect, vi, it } from 'vitest'
        mockNuxtImport('useSomeExport', () => 'bob')
        
        it('test', () => {
          const a = vi.fn()
        })
      `)
      expect(code).toMatchInlineSnapshot(`
        "
                import { expect, vi, it } from 'vitest'
        vi.hoisted(() => { 
                if(!globalThis.__NUXT_VITEST_MOCKS){
                  vi.stubGlobal("__NUXT_VITEST_MOCKS", {})
                }
              });

        vi.mock("bob", async (importOriginal) => {
          const mocks = globalThis.__NUXT_VITEST_MOCKS
          if (!mocks["bob"]) {
            mocks["bob"] = { ...await importOriginal("bob") }
          }
          mocks["bob"]["useSomeExport"] = await (() => 'bob')();
          return mocks["bob"] 
        });

                
                
                it('test', () => {
                  const a = vi.fn()
                })
              
         import "bob";"
      `)
      expect(code).not.toContain('import {vi} from "vitest";')
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
      expect(await getResult(`
        import { mockComponent } from '@nuxt/test-utils/runtime'
        mockComponent('MyComponent', () => import('./MockComponent.vue'))
      `)).toMatchInlineSnapshot(`
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
                
              "
      `)
    })
  })
})
