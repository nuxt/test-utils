<template>
  <ul>
    <li data-testid="greeting-in-setup">
      {{ greetingInSetup }}
    </li>
    <li data-testid="greeting-in-data1">
      {{ greetingInData1 }}
    </li>
    <li data-testid="greeting-in-data2">
      {{ greetingInData2 }}
    </li>
    <li data-testid="greeting-in-computed">
      {{ greetingInComputed }}
    </li>
    <li data-testid="computed-data1">
      {{ computedData1 }}
    </li>
    <li data-testid="computed-greeting-in-methods">
      {{ computedGreetingInMethods }}
    </li>
    <li data-testid="greeting-in-methods">
      {{ greetingInMethods() }}
    </li>
    <li data-testid="return-data1">
      {{ returnData1() }}
    </li>
    <li data-testid="return-computed-data1">
      {{ returnComputedData1() }}
    </li>
    <li>
      <button
        data-testid="button-in-page"
        @click="onClickButtonInPage"
      >
        Button in page
      </button>
    </li>
    <li>
      <TestButton @test-button-click="onClickButtonInComponent" />
    </li>
  </ul>
</template>

<script lang="ts">
import TestButton from '~/components/TestButton.vue'

export default defineNuxtComponent({
  name: 'OptionsApiPage',
  components: {
    TestButton,
  },
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
    onClickButtonInPage() {
      if (this === undefined) {
        console.error('this in onClickButtonInPage is undefined')
      }
    },
    onClickButtonInComponent() {
      if (this === undefined) {
        console.error('this in onClickButtonInComponent is undefined')
      }
    },
  },
})
</script>
