<script setup lang="ts">
const input = ref(0)

function getRandom() {
  return Math.trunc(Math.random() * 101)
}

function random(rand: number) {
  input.value = rand * 2
}

function getRandom2() {
  return Math.trunc(Math.random() * 101)
}

function random2(rand: number) {
  input.value = rand * 2
}

defineExpose({
  getRandom2,
  random2,
})
</script>

<template>
  <div>
    <input
      v-model="input"
      type="number"
    >
    <button
      id="random"
      @click="random(getRandom())"
    >
      Random
    </button>
    <button
      id="random2"
      @click="random2(getRandom2())"
    >
      Random2
    </button>
  </div>
</template>
