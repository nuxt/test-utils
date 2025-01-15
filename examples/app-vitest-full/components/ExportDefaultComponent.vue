<template>
  <div>
    <h1>ExportDefaultComponent</h1>
    <pre>{{ myProp }}</pre>
    <pre>{{ setupMyProp }}</pre>
    <span
      v-for="item in myArrayProp"
      :key="item"
    >{{ item }}
    </span>
    <span>myObjProp: {{ JSON.stringify(myObjProp) }}</span>
  </div>
</template>

<!--
<script setup lang="ts">
const props = defineProps<{ myProp: string }>()
const setupMyProp = 'X' + props.myProp
</script>

Following script is a valid Vue 3 way to define a component
-->

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
    return {
      setupMyProp: 'X' + props.myProp,
    }
  },
}
</script>
