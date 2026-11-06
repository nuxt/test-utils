import type { CompilerOptions } from '@vue/compiler-sfc'

type NodeTransform = NonNullable<CompilerOptions['nodeTransforms']>[number]

const NodeTypes = {
  ELEMENT: 1,
  SIMPLE_EXPRESSION: 4,
  ATTRIBUTE: 6,
  DIRECTIVE: 7,
} as const

const ElementTypes = {
  SLOT: 2,
} as const

export function removeAttrsNodeTransform(attrs: string[]): NodeTransform {
  const attrNames = attrs.map(s => s.toLowerCase())
  return (node) => {
    if (node.type !== NodeTypes.ELEMENT || node.tagType === ElementTypes.SLOT) return

    const { props } = node

    for (let i = props.length - 1; i >= 0; i--) {
      const prop = props[i]!

      if (
        (
          prop.type === NodeTypes.ATTRIBUTE
          && attrNames.includes(prop.name.toLowerCase()))
        || (
          prop.type === NodeTypes.DIRECTIVE
          && prop.name === 'bind'
          && prop.arg
          && prop.arg.type === NodeTypes.SIMPLE_EXPRESSION
          && prop.arg.isStatic
          && attrNames.includes(prop.arg.content.toLowerCase())
        )
      ) {
        props.splice(i, 1)
      }
    }
  }
}
