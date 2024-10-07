<template>
  <ul>
    <li data-testid="greetingInSetup">
      {{ greetingInSetup }}
    </li>
    <li data-testid="greetingInData1">
      {{ greetingInData1 }}
    </li>
    <li data-testid="greetingInData2">
      {{ greetingInData2 }}
    </li>
    <li data-testid="greetingInComputed">
      {{ greetingInComputed }}
    </li>
    <li data-testid="computedData1">
      {{ computedData1 }}
    </li>
    <li data-testid="computedGreetingInMethods">
      {{ computedGreetingInMethods }}
    </li>
    <li data-testid="greetingInMethods">
      {{ greetingInMethods() }}
    </li>
    <li data-testid="returnData1">
      {{ returnData1() }}
    </li>
    <li data-testid="returnComputedData1">
      {{ returnComputedData1() }}
    </li>
  </ul>
</template>

<script lang="ts">
export default defineNuxtComponent({
  name: 'OptionsApiPage',
  setup() {
    return {
      greetingInSetup: 'Hello, setup',
    }
  },
  async asyncData() {
    return {
      greetingInData2: 'Hello, overwritten by asyncData',
    }
  },
  data() {
    return {
      greetingInData1: 'Hello, data1',
      greetingInData2: 'Hello, data2',
    }
  },
  computed: {
    greetingInComputed() {
      return 'Hello, computed property'
    },
    computedData1() {
      return this.greetingInData1
    },
    computedGreetingInMethods() {
      return this.greetingInMethods()
    },
  },
  methods: {
    greetingInMethods() {
      return 'Hello, method'
    },
    returnData1() {
      return this.greetingInData1
    },
    returnComputedData1() {
      return this.computedData1
    },
  },
})
</script>
