<template>
  <ul>
    <li data-testid="simple-function">
      {{ simpleFunction }}
    </li>
    <li data-testid="object-with-get">
      {{ objectWithGet }}
    </li>
    <li data-testid="object-with-get-and-set">
      {{ objectWithGetAndSet }}
    </li>
    <li>
      <button
        data-testid="hanlde-change-object-with-get-and-set"
        @click="hanldeChangeObjectWithGetAndSet"
      >
        Change
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      localStateForObjectWithGetAndSet: 'object-with-get-and-set',
    }
  },
  computed: {
    simpleFunction() {
      return 'simple-function'
    },
    objectWithGet: {
      get() {
        return 'object-with-get'
      },
    },
    objectWithGetAndSet: {
      get() {
        return this.localStateForObjectWithGetAndSet
      },
      set(localStateForObjectWithGetAndSet) {
        this.localStateForObjectWithGetAndSet = localStateForObjectWithGetAndSet
      },
    },
  },
  methods: {
    hanldeChangeObjectWithGetAndSet() {
      this.objectWithGetAndSet = `${this.objectWithGetAndSet} (changed)`
    },
  },
}
</script>
