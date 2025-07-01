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
}
</script>
