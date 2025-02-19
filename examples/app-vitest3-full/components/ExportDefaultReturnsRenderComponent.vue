<script lang="ts">
export default {
  props: {
    myProp: {
      type: String,
      required: true,
    },
    myArrayProp: {
      type: Array as PropType<string[]>,
      default: () => ([]),
    },
    myObjProp: {
      type: Object as PropType<{ title: string }>,
      default: () => ({}),
    },
  },
  setup(props) {
    const pre = 'X' + props.myProp
    return () => h('div', [
      h('h1', 'ExportDefaultReturnsRenderComponent'),
      h('pre', props.myProp),
      h('pre', pre),
      props.myArrayProp.map(item => h('span', item)),
      h('span', `myObjProp: ${JSON.stringify(props.myObjProp)}`),
    ])
  },
}
</script>
