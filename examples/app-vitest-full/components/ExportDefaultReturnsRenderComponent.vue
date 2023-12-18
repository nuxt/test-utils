<script lang="ts">
export default {
  props: {
    myProp: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const pre = 'X' + props.myProp
    return () => h('div', [
      h('h1', 'ExportDefaultReturnsRenderComponent'),
      h('pre', props.myProp),
      h('pre', pre)
    ])
  },
}
</script>
