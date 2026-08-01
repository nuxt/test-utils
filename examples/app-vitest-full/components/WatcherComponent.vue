<script setup lang="ts">
const { title } = defineProps<{ title: string }>()

const testState = useState('testState')

watch(testState, (newTestState) => {
  console.log(`Test state has changed in component ${title}: `, newTestState)
})
</script>

<template>
  <div>
    {{ title }}
  </div>
</template>
