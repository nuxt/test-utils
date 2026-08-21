<script setup lang="ts">
const { public: { site } } = useRuntimeConfig()
</script>

<template>
  <header>
    <h1>{{ site.title }}</h1>
    <nav>
      <ul>
        <NuxtLink to="/">Top</NuxtLink>
      </ul>
    </nav>
  </header>
</template>
