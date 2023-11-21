<script lang="ts">
export default {
  props: {
    myProp: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => h('div', [
      h('h1', 'ExportDefaultReturnsRenderComponent'),
      h('pre', props.myProp),
      h('pre', 'X' + props.myProp)
    ])
  },
}
</script>
