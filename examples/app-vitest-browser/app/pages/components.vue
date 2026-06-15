<script setup lang="ts">
definePageMeta({
  title: 'Components',
})
</script>

<template>
  <section>
    <ul>
      <li
        v-for="name of ['counter', 'hello']"
        :key="name"
      >
        <NuxtLink :to="`/components/${name}`">
          {{ `${name[0]?.toUpperCase()}${name.substring(1)}` }}
        </NuxtLink>
      </li>
    </ul>
    <NuxtPage />
  </section>
</template>
