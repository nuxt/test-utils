<template>
  <main>
    <h1>Interactive Page</h1>
    <button @click="addViolation">
      Add violation
    </button>
    <div v-if="showViolation">
      <button />
    </div>
  </main>
</template>

<script setup>
const showViolation = ref(false)

function addViolation() {
  showViolation.value = true
}
</script>
