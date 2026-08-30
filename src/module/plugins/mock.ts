import type { Import } from 'unimport'
import { walk } from 'estree-walker'
import type { CallExpression, Expression, ExpressionStatement, Identifier, ImportDeclaration, ImportSpecifier, Literal, Node, SpreadElement } from 'estree'
import type { AstNode } from 'rollup'
import MagicString from 'magic-string'
import type { Component } from '@nuxt/schema'
import type { Plugin } from 'vite'
import { createUnplugin } from 'unplugin'

export interface MockPluginContext {
  imports: Import[]
  components: Component[]
}

const PLUGIN_NAME = 'nuxt:vitest:mock-transform'

const HELPER_MOCK_IMPORT = 'mockNuxtImport'
const HELPER_UNMOCK_IMPORT = 'unmockNuxtImport'
const HELPER_MOCK_COMPONENT = 'mockComponent'
const HELPER_MOCK_HOIST = '__NUXT_VITEST_MOCKS'
const HELPER_MOCK_HOIST_ORIGINAL = '__NUXT_VITEST_MOCKS_ORIGINAL'
const HELPER_MOCK_HOIST_PREVIOUS = '__NUXT_VITEST_MOCKS_PREVIOUS'

const HELPERS_NAME = [
  HELPER_MOCK_IMPORT,
  HELPER_UNMOCK_IMPORT,
  HELPER_MOCK_COMPONENT,
]

interface MockImportInfo {
  name: string
  import: Import
  factory: string | undefined
}

interface MockComponentInfo {
  path: string
  factory: string
}

export const createMockPlugin = (ctx: MockPluginContext) => createUnplugin(() => {
  return {
    name: PLUGIN_NAME,
    enforce: 'post',
    vite: {
      transform(code, id) {
        if (!HELPERS_NAME.some(n => code.includes(n))) return
        if (id.includes('/node_modules/')) return

        let ast: AstNode
        try {
          ast = this.parse(code, {
            // @ts-expect-error compatibility with rollup v3
            sourceType: 'module', ecmaVersion: 'latest', ranges: true,
          })
        }
        catch {
          return
        }

        let insertionPoint = 0
        let hasViImport = false

        const s = new MagicString(code)
        const mocksImport: MockImportInfo[] = []
        const unmocksFrom: Set<string> = new Set()
        const mocksComponent: MockComponentInfo[] = []
        const importPathsList: Set<string> = new Set()

        // @ts-expect-error mismatch between acorn/estree types
        walk(ast, {
          enter: (node, parent) => {
            const removeCallExpression = (start: Node, end = start) => s.overwrite(
              isExpressionStatement(parent)
                ? startOf(parent)
                : startOf(start),
              isExpressionStatement(parent)
                ? endOf(parent)
                : endOf(end),
              '')

            const parseMockImportTarget = (importTarget: Expression | SpreadElement, helperName: string) => {
              const name = isLiteral(importTarget)
                ? importTarget.value
                : isIdentifier(importTarget) ? importTarget.name : undefined
              if (typeof name !== 'string') {
                return this.error(
                  new Error(
                    `The first argument of ${helperName}() must be a string literal or mocked target`,
                  ),
                  startOf(importTarget),
                )
              }
              return {
                name,
                importItem: ctx.imports.find(_ => name === (_.as || _.name)),
              }
            }

            // find existing vi import
            if (isImportDeclaration(node)) {
              if (node.source.value === 'vitest' && !hasViImport) {
                const viImport = node.specifiers.find(
                  i =>
                    isImportSpecifier(i) && i.imported.type === 'Identifier' && i.imported.name === 'vi',
                )
                if (viImport) {
                  insertionPoint = endOf(node)
                  hasViImport = true
                }
                return
              }
            }

            if (!isCallExpression(node)) return
            // mockNuxtImport
            if (
              isIdentifier(node.callee)
              && node.callee.name === HELPER_MOCK_IMPORT
            ) {
              if (node.arguments.length !== 2) {
                return this.error(
                  new Error(
                    `${HELPER_MOCK_IMPORT}() should have exactly 2 arguments`,
                  ),
                  startOf(node),
                )
              }

              const { name, importItem } = parseMockImportTarget(node.arguments[0]!, HELPER_MOCK_IMPORT)
              if (!importItem) {
                return this.error(`Cannot find import "${name}" to mock`)
              }

              removeCallExpression(node.arguments[0]!, node.arguments[1]!)

              mocksImport.push({
                name,
                import: importItem,
                factory: code.slice(
                  startOf(node.arguments[1]!),
                  endOf(node.arguments[1]!),
                ),
              })
            }
            // unmockNuxtImport
            if (
              isIdentifier(node.callee)
              && node.callee.name === HELPER_UNMOCK_IMPORT
            ) {
              if (node.arguments.length !== 1) {
                return this.error(
                  new Error(
                    `${HELPER_UNMOCK_IMPORT}() should have exactly 1 argument`,
                  ),
                  startOf(node),
                )
              }

              const { name, importItem } = parseMockImportTarget(node.arguments[0]!, HELPER_UNMOCK_IMPORT)
              if (!importItem) {
                return this.error(`Cannot find import "${name}" to unmock`)
              }

              removeCallExpression(node.arguments[0]!)

              unmocksFrom.add(importItem.from)

              // factory is not set, restore to original
              mocksImport.push({
                name,
                import: importItem,
                factory: undefined,
              })
            }
            // mockComponent
            if (
              isIdentifier(node.callee)
              && node.callee.name === HELPER_MOCK_COMPONENT
            ) {
              if (node.arguments.length !== 2) {
                return this.error(
                  new Error(
                    `${HELPER_MOCK_COMPONENT}() should have exactly 2 arguments`,
                  ),
                  startOf(node),
                )
              }
              const componentName = node.arguments[0]!
              if (!isLiteral(componentName) || typeof componentName.value !== 'string') {
                return this.error(
                  new Error(
                    `The first argument of ${HELPER_MOCK_COMPONENT}() must be a string literal`,
                  ),
                  startOf(componentName),
                )
              }
              const pathOrName = componentName.value
              const component = ctx.components.find(
                _ => _.pascalName === pathOrName || _.kebabName === pathOrName,
              )
              const path = component?.filePath || pathOrName

              removeCallExpression(node.arguments[1]!)

              mocksComponent.push({
                path: path,
                factory: code.slice(
                  startOf(node.arguments[1]!),
                  endOf(node.arguments[1]!),
                ),
              })
            }
          },
        })

        if (mocksImport.length === 0 && mocksComponent.length === 0) return

        const mockLines: string[] = []

        for (const from of unmocksFrom) {
          mockLines.push(`vi.unmock(${JSON.stringify(from)});`)
        }

        for (const [from, mocks] of mapGroupBy(mocksImport, mock => mock.import.from)) {
          importPathsList.add(from)
          const quotedFrom = JSON.stringify(from)
          const mockModuleEntry = `globalThis.${HELPER_MOCK_HOIST}[${quotedFrom}]`
          mockLines.push(
            `vi.mock(${quotedFrom}, async (importOriginal) => {`,
            `  if (!${mockModuleEntry} || ${unmocksFrom.has(from)}) {`,
            `    const original = await importOriginal()`,
            `    const previous = (${mockModuleEntry} ?? {}).${HELPER_MOCK_HOIST_PREVIOUS} ?? {}`,
            `    ${mockModuleEntry} = { ...original, ...previous }`,
            `    ${mockModuleEntry}.${HELPER_MOCK_HOIST_ORIGINAL} = { ...original }`,
            `    ${mockModuleEntry}.${HELPER_MOCK_HOIST_PREVIOUS} = {}`,
            `  }`,
          )

          for (const mock of mocks) {
            const quotedName = JSON.stringify(mock.import.name)
            const original = `${mockModuleEntry}.${HELPER_MOCK_HOIST_ORIGINAL}[${quotedName}]`
            const factory = mock.factory ? `await (${mock.factory})(${original})` : original
            mockLines.push(
              `  ${mockModuleEntry}[${quotedName}] = ${factory}`,
              `  ${mockModuleEntry}.${HELPER_MOCK_HOIST_PREVIOUS}[${quotedName}] = ${mockModuleEntry}[${quotedName}]`,
            )
          }
          mockLines.push(`  return ${mockModuleEntry}`)
          mockLines.push(`});`)
        }

        if (mocksComponent.length) {
          mockLines.push(
            ...mocksComponent.flatMap((mock) => {
              return [
                `vi.mock(${JSON.stringify(mock.path)}, async () => {`,
                `  const factory = (${mock.factory});`,
                `  const result = typeof factory === 'function' ? await factory() : await factory`,
                `  return 'default' in result ? result : { default: result }`,
                '});',
              ]
            }),
          )
        }

        if (!mockLines.length) return

        s.appendLeft(insertionPoint, [
          ``,
          `vi.hoisted(() => {`,
          `  if(!globalThis.${HELPER_MOCK_HOIST}){`,
          `    vi.stubGlobal(${JSON.stringify(HELPER_MOCK_HOIST)}, {})`,
          `  }`,
          `});`,
          ``,
        ].join('\n'))

        if (!hasViImport) s.prepend(`import {vi} from "vitest";\n`)

        s.appendLeft(insertionPoint, '\n' + mockLines.join('\n') + '\n')

        // do an import to trick vite to keep it
        // if not, the module won't be mocked
        importPathsList.forEach((p) => {
          s.append(`\n import ${JSON.stringify(p)};`)
        })

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        }
      },
      // Place Vitest's mock plugin after all Nuxt plugins
      async configResolved(config) {
        const plugins = (config.plugins || []) as Plugin[]

        // `vite:mocks` was a typo in Vitest before v0.34.0
        const vitestPlugins = plugins.filter(p => (p.name === 'vite:mocks' || p.name.startsWith('vitest:')) && (p.enforce || ('order' in p && p.order)) === 'post')
        const lastNuxt = findLastIndex(
          plugins,
          i => !!i?.name?.startsWith('nuxt:'),
        )
        if (lastNuxt === -1) return
        for (const plugin of vitestPlugins) {
          const index = plugins.indexOf(plugin)
          if (index < lastNuxt) {
            plugins.splice(index, 1)
            plugins.splice(lastNuxt, 0, plugin)
          }
        }
      },
    },
  }
})

// Polyfill Array.prototype.findLastIndex for legacy Node.js
function findLastIndex<T>(arr: T[], predicate: (item?: T) => boolean) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i
  }
  return -1
}

function isImportDeclaration(node: Node): node is ImportDeclaration {
  return node.type === 'ImportDeclaration'
}
function isImportSpecifier(node: Node): node is ImportSpecifier {
  return node.type === 'ImportSpecifier'
}
function isCallExpression(node: Node): node is CallExpression {
  return node.type === 'CallExpression'
}
function isIdentifier(node: Node): node is Identifier {
  return node.type === 'Identifier'
}
function isLiteral(node: Node | Expression): node is Literal {
  return node.type === 'Literal'
}
function isExpressionStatement(node: Node | null): node is ExpressionStatement {
  return node?.type === 'ExpressionStatement'
}
// TODO: need to fix in rollup types, probably
function startOf(node: Node) {
  return 'range' in node && node.range ? node.range[0] : ('start' in node ? node.start as number : undefined as never)
}
function endOf(node: Node) {
  return 'range' in node && node.range ? node.range[1] : ('end' in node ? node.end as number : undefined as never)
}
function mapGroupBy<K, T>(items: Iterable<T>, keySelector: (item: T) => K) {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const key = keySelector(item)
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(item)
  }
  return map
}
