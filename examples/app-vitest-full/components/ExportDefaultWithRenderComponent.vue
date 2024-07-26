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
  },
  setup(props) {
    return {
      setupMyProp: 'X' + props.myProp,
    }
  },
  render() {
    return h('div', [
      h('h1', 'ExportDefaultWithRenderComponent'),
      h('pre', this.myProp),
      h('pre', this.setupMyProp),
      this.myArrayProp.map(item => h('span', item)),
    ])
  },
}
</script>
