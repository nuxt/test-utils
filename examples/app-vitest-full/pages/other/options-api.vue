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
    <li data-testid="greeting-in-data3">
      {{ greetingInData3 }}
    </li>
    <li data-testid="greeting-in-data4">
      {{ greetingInData4 }}
    </li>
    <li data-testid="greeting-in-computed">
      {{ greetingInComputed }}
    </li>
    <li data-testid="computed-data1">
      {{ computedData1 }}
    </li>
    <li data-testid="computed-data2">
      {{ computedData2 }}
    </li>
    <li data-testid="computed-with-methods">
      {{ computedWithMethods }}
    </li>
    <li data-testid="computed-with-config">
      {{ computedWithConfig }}
    </li>
    <li data-testid="computed-with-setup-ref">
      {{ computedWithSetupRef }}
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
    <li data-testid="return-computed-data2">
      {{ returnComputedData2() }}
    </li>
    <li data-testid="return-config-data">
      {{ returnConfigData() }}
    </li>
    <li data-testid="return-ref-in-setup-data">
      {{ returnRefInSetupData() }}
    </li>
    <li data-testid="return-props-data">
      {{ returnPropsData() }}
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
  props: {
    prop1: {
      type: String,
      default: 'Hello, default',
    },
  },
  setup() {
    const greetingRefInSetup = ref('Hello, setup')
    return {
      greetingInSetup: 'Hello, setup',
      greetingRefInSetup,
    }
  },
  async asyncData() {
    return {
      greetingInData2: 'Hello, overwritten by asyncData',
    }
  },
  data({ $props }) {
    return {
      greetingInData1: 'Hello, data1',
      greetingInData2: 'Hello, data2',
      greetingInData3: `Hello, ${this.$config.public.hello}`,
      greetingInData4: $props.prop1,
    }
  },
  computed: {
    greetingInComputed() {
      return 'Hello, computed property'
    },
    computedData1() {
      return this.greetingInData1
    },
    computedData2() {
      return this.greetingInData1.split(',')[0]
    },
    computedWithMethods() {
      return this.greetingInMethods()
    },
    computedWithConfig() {
      return `Hello, ${this.$config.public.hello}`
    },
    computedWithSetupRef() {
      return this.greetingRefInSetup.split(',')[0]
    },
    computedWithProps() {
      return this.$props.prop1.split(',')[0]
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
    returnComputedData2() {
      return this.computedData1.split(',')[0]
    },
    returnConfigData() {
      return `Hello, ${this.$config.public.hello}`
    },
    returnRefInSetupData() {
      return this.greetingRefInSetup.split(',')[0]
    },
    returnPropsData() {
      return this.$props.prop1.split(',')[0]
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
