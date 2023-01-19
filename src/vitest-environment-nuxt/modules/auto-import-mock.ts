import type { Import } from 'unimport'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { walk } from 'estree-walker'
import type { CallExpression } from 'estree'
import { AcornNode } from 'rollup'
import MagicString from 'magic-string'

const HELPER_NAME = 'mockNuxtImport'

export interface MockInfo {
  name: string
  import: Import
  factory: string
  start: number
  end: number
}

/**
 * This module is a macro that transforms `mockNuxtImport()` to `vi.mock()`,
 * which make it possible to mock Nuxt imports.
 */
export default defineNuxtModule({
  meta: {
    name: 'vitest-env:auto-import-mock',
  },
  setup(_, nuxt) {
    let imports: Import[] = []

    nuxt.hook('imports:extend', _ => {
      imports = _
    })

    addVitePlugin({
      name: 'nuxt:auto-import-mock',
      transform(code, id) {
        if (!code.includes(HELPER_NAME)) return
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

        const mocks: MockInfo[] = []

        walk(ast, {
          enter: node => {
            if (node.type !== 'CallExpression') return
            const call = node as CallExpression
            if (
              call.callee.type !== 'Identifier' ||
              call.callee.name !== HELPER_NAME
            ) {
              return
            }
            if (call.arguments.length !== 2) {
              return
            }
            if (call.arguments[0].type !== 'Literal') {
              return // TODO: warn
            }
            const name = call.arguments[0].value as string
            const importItem = imports.find(_ => name === (_.as || _.name))
            if (!importItem) {
              return this.error(`Cannot find import "${name}" to mock`)
            }
            mocks.push({
              name,
              import: importItem,
              factory: code.slice(
                call.arguments[1].range![0],
                call.arguments[1].range![1]
              ),
              start: call.range![0],
              end: call.range![1],
            })
          },
        })

        if (!mocks.length) return

        const s = new MagicString(code)

        const mockMap = new Map<string, MockInfo[]>()
        for (const mock of mocks) {
          s.overwrite(mock.start, mock.end, '')
          if (!mockMap.has(mock.import.from)) {
            mockMap.set(mock.import.from, [])
          }
          mockMap.get(mock.import.from)!.push(mock)
        }

        const mockCode = [...mockMap.entries()]
          .map(([from, mocks]) => {
            const lines = [
              `vi.mock(${JSON.stringify(from)}, async () => {`,
              `  const mod = { ...await vi.importActual(${JSON.stringify(
                from
              )}) }`,
            ]
            for (const mock of mocks) {
              lines.push(
                `  mod[${JSON.stringify(mock.name)}] = (${mock.factory})()`
              )
            }
            lines.push(`  return mod`)
            lines.push(`})`)
            return lines.join('\n')
          })
          .join('\n')

        s.append('\nimport {vi} from "vitest";\n' + mockCode)

        return {
          code: s.toString(),
          map: s.generateMap(),
        }
      },
    })
  },
})
