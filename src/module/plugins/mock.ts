import type { Import } from 'unimport'
import { walk } from 'estree-walker'
import type { CallExpression, Expression, ExpressionStatement, Identifier, ImportDeclaration, ImportSpecifier, Literal, Node } from 'estree'
import type { AstNode, TransformPluginContext, TransformResult } from 'rollup'
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

export const createMockPlugin = (ctx: MockPluginContext) => createUnplugin(() => {
  function transform(this: TransformPluginContext, code: string, id: string): TransformResult | Promise<TransformResult> {
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
    const mocksComponent: MockComponentInfo[] = []
    const importPathsList: Set<string> = new Set()

    // @ts-expect-error mismatch between acorn/estree types
    walk(ast, {
      enter: (node, parent) => {
        // find existing vi import
        if (isImportDeclaration(node)) {
          if (node.source.value === 'vitest' && !hasViImport) {
            const viImport = node.specifiers.find(
              i =>
                isImportSpecifier(i) && i.imported.name === 'vi',
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
          const importName = node.arguments[0]
          if (!isLiteral(importName) || typeof importName.value !== 'string') {
            return this.error(
              new Error(
                `The first argument of ${HELPER_MOCK_IMPORT}() must be a string literal`,
              ),
              startOf(importName),
            )
          }
          const name = importName.value
          const importItem = ctx.imports.find(_ => name === (_.as || _.name))
          if (!importItem) {
            console.log({ imports: ctx.imports })
            return this.error(`Cannot find import "${name}" to mock`)
          }

          s.overwrite(
            isExpressionStatement(parent)
              ? startOf(parent)
              : startOf(node.arguments[0]),
            isExpressionStatement(parent)
              ? endOf(parent)
              : endOf(node.arguments[1]),
            '',
          )
          mocksImport.push({
            name,
            import: importItem,
            factory: code.slice(
              startOf(node.arguments[1]),
              endOf(node.arguments[1]),
            ),
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
          const componentName = node.arguments[0]
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

          s.overwrite(
            isExpressionStatement(parent)
              ? startOf(parent)
              : startOf(node.arguments[1]),
            isExpressionStatement(parent)
              ? endOf(parent)
              : endOf(node.arguments[1]),
            '',
          )
          mocksComponent.push({
            path: path,
            factory: code.slice(
              startOf(node.arguments[1]),
              endOf(node.arguments[1]),
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
              `vi.mock(${JSON.stringify(from)}, async (importOriginal) => {`,
              `  const mocks = globalThis.${HELPER_MOCK_HOIST}`,
              `  if (!mocks[${JSON.stringify(from)}]) {`,
              `    mocks[${JSON.stringify(from)}] = { ...await importOriginal(${JSON.stringify(from)}) }`,
              `  }`,
            ]
            for (const mock of mocks) {
              if (mock.import.name === 'default') {
                lines.push(
                  `  mocks[${JSON.stringify(from)}]["default"] = await (${mock.factory})();`,
                )
              }
              else {
                lines.push(
                  `  mocks[${JSON.stringify(from)}][${JSON.stringify(mock.name)}] = await (${mock.factory})();`,
                )
              }
            }
            lines.push(`  return mocks[${JSON.stringify(from)}] `)
            lines.push(`});`)
            return lines
          },
        ),
      )
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

    s.prepend(`vi.hoisted(() => { 
        if(!globalThis.${HELPER_MOCK_HOIST}){
          vi.stubGlobal(${JSON.stringify(HELPER_MOCK_HOIST)}, {})
        }
      });\n`)

    if (!hasViImport) s.prepend(`import {vi} from "vitest";\n`)

    s.appendLeft(insertionPoint, mockLines.join('\n') + '\n')

    // do an import to trick vite to keep it
    // if not, the module won't be mocked
    importPathsList.forEach((p) => {
      s.append(`\n import ${JSON.stringify(p)};`)
    })

    return {
      code: s.toString(),
      map: s.generateMap(),
    }
  }

  return {
    name: PLUGIN_NAME,
    enforce: 'post',
    vite: {
      transform,
      // Place Vitest's mock plugin after all Nuxt plugins
      async configResolved(config) {
        const plugins = (config.plugins || []) as Plugin[]

        // `vite:mocks` was a typo in Vitest before v0.34.0
        const vitestPlugins = plugins.filter(p => (p.name === 'vite:mocks' || p.name.startsWith('vitest:')) && (p.enforce || ('order' in p && p.order)) === 'post')
        const lastNuxt = findLastIndex(
          plugins,
          i => i.name?.startsWith('nuxt:'),
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
function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean) {
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
