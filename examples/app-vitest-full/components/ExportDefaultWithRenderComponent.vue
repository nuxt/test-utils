<script lang="ts">
export default {
  props: {
    myProp: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return {
      setupMyProp: 'X' + props.myProp
    }
  },
  render() {
    return h('div', [
      h('h1', 'ExportDefaultWithRenderComponent'),
      h('pre', this.myProp),
      h('pre', this.setupMyProp)
    ])
  },
}
</script>
