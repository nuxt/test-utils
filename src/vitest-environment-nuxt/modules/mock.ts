import type { Import, Unimport } from 'unimport'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { walk } from 'estree-walker'
import type { CallExpression } from 'estree'
import type { AcornNode } from 'rollup'
import MagicString from 'magic-string'
import type { Component } from '@nuxt/schema'
import type { Plugin } from 'vite'
import { resolve, normalize } from 'path'

const PLUGIN_NAME = 'nuxt:vitest:mock-transform'

const HELPER_MOCK_IMPORT = 'mockNuxtImport'
const HELPER_MOCK_COMPONENT = 'mockComponent'
const HELPER_MOCK_HOIST = '__NUXT_VITEST_MOCKS'

const HELPERS_NAME = [HELPER_MOCK_IMPORT, HELPER_MOCK_COMPONENT]

export interface MockImportInfo {
  name: string
  import: Import
  factory: string
}

export interface MockComponentInfo {
  path: string
  factory: string
}

/**
 * This module is a macro that transforms `mockNuxtImport()` to `vi.mock()`,
 * which make it possible to mock Nuxt imports.
 */
export default defineNuxtModule({
  meta: {
    name: PLUGIN_NAME,
  },
  setup(_, nuxt) {
    let importsCtx: Unimport
    let imports: Import[] = []
    let components: Component[] = []

    nuxt.hook('imports:context', async ctx => {
      importsCtx = ctx
    })
    nuxt.hook('components:extend', _ => {
      components = _
    })
    nuxt.hook('ready', async () => {
      imports = await importsCtx.getImports()
    })

    // Polyfill Array.prototype.findLastIndex for legacy Node.js
    function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) return i
      }
      return -1
    }

    // path of the first vitest setup file to be ran
    let resolvedFirstSetupFile: null | string = null
    addVitePlugin({
      name: PLUGIN_NAME,
      enforce: 'post',
      // Place Vitest's mock plugin after all Nuxt plugins
      configResolved(config) {
        const firstSetupFile = Array.isArray(config.test?.setupFiles)
          ? config.test!.setupFiles[0]
          : config.test?.setupFiles

        if (firstSetupFile) {
          resolvedFirstSetupFile = normalize(resolve(firstSetupFile))
        }

        const plugins = (config.plugins || []) as Plugin[]
        // `vite:mocks` was a typo in Vitest before v0.34.0
        const mockPluginIndex = plugins.findIndex(
          i => i.name === 'vite:mocks' || i.name === 'vitest:mocks'
        )
        const lastNuxt = findLastIndex(
          plugins,
          i => i.name?.startsWith('nuxt:')
        )
        if (mockPluginIndex !== -1 && lastNuxt !== -1) {
          if (mockPluginIndex < lastNuxt) {
            const [mockPlugin] = plugins.splice(mockPluginIndex, 1)
            plugins.splice(lastNuxt, 0, mockPlugin)
          }
        }
      },
      transform: {
        handler(code, id) {
          const isFirstSetupFile = normalize(id) === resolvedFirstSetupFile
          const shouldPrependMockHoist = resolvedFirstSetupFile
            ? isFirstSetupFile
            : true

          if (!HELPERS_NAME.some(n => code.includes(n))) return
          if (id.includes('/node_modules/')) return

          let ast: AcornNode
          try {
            ast = this.parse(code, {
              sourceType: 'module',
              ecmaVersion: 'latest',
              ranges: true,
            })
          } catch (e) {
            return
          }

          let insertionPoint = 0
          let hasViImport = false

          const s = new MagicString(code)
          const mocksImport: MockImportInfo[] = []
          const mocksComponent: MockComponentInfo[] = []
          const importPathsList: Set<string> = new Set()

          walk(ast as any, {
            enter: (node, parent) => {
              // find existing vi import
              if (node.type === 'ImportDeclaration') {
                if (node.source.value === 'vitest' && !hasViImport) {
                  if (
                    node.specifiers.find(
                      i =>
                        i.type === 'ImportSpecifier' && i.imported.name === 'vi'
                    )
                  ) {
                    insertionPoint = node.range![1]
                    hasViImport = true
                  }
                  return
                }
              }

              if (node.type !== 'CallExpression') return
              const call = node as CallExpression
              // mockNuxtImport
              if (
                call.callee.type === 'Identifier' &&
                call.callee.name === HELPER_MOCK_IMPORT
              ) {
                if (call.arguments.length !== 2) {
                  return this.error(
                    new Error(
                      `${HELPER_MOCK_IMPORT}() should have exactly 2 arguments`
                    ),
                    call.range![0]
                  )
                }
                if (call.arguments[0].type !== 'Literal') {
                  return this.error(
                    new Error(
                      `The first argument of ${HELPER_MOCK_IMPORT}() must be a string literal`
                    ),
                    call.arguments[0].range![0]
                  )
                }
                const name = call.arguments[0].value as string
                const importItem = imports.find(_ => name === (_.as || _.name))
                if (!importItem) {
                  console.log({ imports })
                  return this.error(`Cannot find import "${name}" to mock`)
                }

                s.overwrite(
                  parent?.type === 'ExpressionStatement'
                    ? parent.range![0]
                    : call.arguments[0].range![0],
                  parent?.type === 'ExpressionStatement'
                    ? parent.range![1]
                    : call.arguments[1].range![1],
                  ''
                )
                mocksImport.push({
                  name,
                  import: importItem,
                  factory: code.slice(
                    call.arguments[1].range![0],
                    call.arguments[1].range![1]
                  ),
                })
              }
              // mockComponent
              if (
                call.callee.type === 'Identifier' &&
                call.callee.name === HELPER_MOCK_COMPONENT
              ) {
                if (call.arguments.length !== 2) {
                  return this.error(
                    new Error(
                      `${HELPER_MOCK_COMPONENT}() should have exactly 2 arguments`
                    ),
                    call.range![0]
                  )
                }
                if (call.arguments[0].type !== 'Literal') {
                  return this.error(
                    new Error(
                      `The first argument of ${HELPER_MOCK_COMPONENT}() must be a string literal`
                    ),
                    call.arguments[0].range![0]
                  )
                }
                const pathOrName = call.arguments[0].value as string
                const component = components.find(
                  _ => _.pascalName === pathOrName || _.kebabName === pathOrName
                )
                const path = component?.filePath || pathOrName

                s.overwrite(
                  parent?.type === 'ExpressionStatement'
                    ? parent.range![0]
                    : call.arguments[1].range![0],
                  parent?.type === 'ExpressionStatement'
                    ? parent.range![1]
                    : call.arguments[1].range![1],
                  ''
                )
                mocksComponent.push({
                  path: path,
                  factory: code.slice(
                    call.arguments[1].range![0],
                    call.arguments[1].range![1]
                  ),
                })
              }
            },
          })

          if (mocksImport.length === 0 && mocksComponent.length === 0) return

          const mockLines = []

          if (mocksImport.length) {
            const mockImportMap = new Map<string, MockImportInfo[]>()
            for (const mock of mocksImport) {
              if (!mockImportMap.has(mock.import.from)) {
                mockImportMap.set(mock.import.from, [])
              }
              mockImportMap.get(mock.import.from)!.push(mock)
            }
            mockLines.push(
              ...Array.from(mockImportMap.entries()).flatMap(
                ([from, mocks]) => {
                  importPathsList.add(from)
                  const lines = [
                    `vi.mock(${JSON.stringify(
                      from
                    )}, async (importOriginal) => {`,
                    `  const mocks = global.${HELPER_MOCK_HOIST}`,
                    `  if (!mocks[${JSON.stringify(
                      from
                    )}]) { mocks[${JSON.stringify(
                      from
                    )}] = { ...await importOriginal(${JSON.stringify(
                      from
                    )}) } }`,
                  ]
                  for (const mock of mocks) {
                    if (mock.import.name === 'default') {
                      lines.push(
                        `  mocks[${JSON.stringify(from)}]["default"] = await (${
                          mock.factory
                        })()`
                      )
                    } else {
                      lines.push(
                        `  mocks[${JSON.stringify(from)}][${JSON.stringify(
                          mock.name
                        )}] = await (${mock.factory})()`
                      )
                    }
                  }
                  lines.push(`  return mocks[${JSON.stringify(from)}] `)
                  lines.push(`})`)
                  return lines
                }
              )
            )
          }

          if (mocksComponent.length) {
            mockLines.push(
              ...mocksComponent.flatMap(mock => {
                return [
                  `vi.mock(${JSON.stringify(mock.path)}, async () => {`,
                  `  const factory = (${mock.factory});`,
                  `  const result = typeof factory === 'function' ? await factory() : await factory`,
                  `  return 'default' in result ? result : { default: result }`,
                  '})',
                ]
              })
            )
          }

          if (!mockLines.length) return

          s.prepend(`vi.hoisted(() => { 
              if(!global.${HELPER_MOCK_HOIST}){
                vi.stubGlobal(${JSON.stringify(HELPER_MOCK_HOIST)}, {})
              }
            });\n`)

          if (!hasViImport) s.prepend(`import {vi} from "vitest";\n`)

          s.appendLeft(insertionPoint, mockLines.join('\n') + '\n')

          // do an import to trick vite to keep it
          // if not, the module won't be mocked
          if (shouldPrependMockHoist) {
            importPathsList.forEach(p => {
              s.append(`\n import ${JSON.stringify(p)};`)
            })
          }

          return {
            code: s.toString(),
            map: s.generateMap(),
          }
        },
      },
    })
  },
})
