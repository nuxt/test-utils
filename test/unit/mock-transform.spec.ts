import { beforeEach, describe, expect, it } from "vitest"
import { type MockPluginContext, createMockPlugin } from "../../src/module/plugins/mock"
import { parse } from 'acorn'

describe('mocking', () => {
  const pluginContext: MockPluginContext = { imports: [], components: [] }
  const plugin = createMockPlugin(pluginContext)
  const getResult = (code: string): undefined | string =>
  (plugin.raw as any)().vite.transform.handler.call({ parse }, code, '/some/file.ts')?.code
  
  beforeEach(() => {
    pluginContext.components = []
    pluginContext.imports = []
  })

  describe('import mocking', () => {
    it('should transform code with mocked imports', () => {
      pluginContext.imports = [{
        name: 'useSomeExport',
        from: 'bob'
      }]
      expect(getResult(`
        import { mockNuxtImport } from '@nuxt/test-utils/runtime-utils'
        mockNuxtImport('useSomeExport', () => {
          return () => 'mocked'
        })
      `)).toMatchInlineSnapshot(`
        "import {vi} from \\"vitest\\";
        vi.hoisted(() => { 
                      if(!global.__NUXT_VITEST_MOCKS){
                        vi.stubGlobal(\\"__NUXT_VITEST_MOCKS\\", {})
                      }
                    });
        vi.mock(\\"bob\\", async (importOriginal) => {
          const mocks = global.__NUXT_VITEST_MOCKS
          if (!mocks[\\"bob\\"]) { mocks[\\"bob\\"] = { ...await importOriginal(\\"bob\\") } }
          mocks[\\"bob\\"][\\"useSomeExport\\"] = await (() => {
                  return () => 'mocked'
                })()
          return mocks[\\"bob\\"] 
        })

                import { mockNuxtImport } from '@nuxt/test-utils/runtime-utils'
                
              
         import \\"bob\\";"
      `)
    })
    it('should not add `vi` import if it already exists', () => {
      pluginContext.imports = [{
        name: 'useSomeExport',
        from: 'bob'
      }]
      const code = getResult(`
        import { expect, vi } from 'vitest'
        mockNuxtImport('useSomeExport', () => 'bob')
      `)
      expect(code).not.toContain('import {vi} from "vitest";')
    })
  })

  describe('component mocking', () => {
    it('should work', () => {
      pluginContext.components = [{
        chunkName: 'Thing',
        export: 'default',
        kebabName: 'thing',
        pascalName: 'Thing',
        prefetch: false,
        preload: false,
        shortPath: 'thing.vue',
        filePath: '/test/thing.vue'
      }]
      expect(getResult(`
        import { mockComponent } from '@nuxt/test-utils/runtime-utils'
        mockComponent('MyComponent', () => import('./MockComponent.vue'))
      `)).toMatchInlineSnapshot(`
        "import {vi} from \\"vitest\\";
        vi.hoisted(() => { 
                      if(!global.__NUXT_VITEST_MOCKS){
                        vi.stubGlobal(\\"__NUXT_VITEST_MOCKS\\", {})
                      }
                    });
        vi.mock(\\"MyComponent\\", async () => {
          const factory = (() => import('./MockComponent.vue'));
          const result = typeof factory === 'function' ? await factory() : await factory
          return 'default' in result ? result : { default: result }
        })

                import { mockComponent } from '@nuxt/test-utils/runtime-utils'
                
              "
      `)
    })
  })
})
