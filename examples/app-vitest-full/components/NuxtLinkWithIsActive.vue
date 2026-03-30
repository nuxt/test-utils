<template>
  <div>
    <NuxtLink to="/">
      Home
    </NuxtLink>
    <NuxtLink
      v-slot="{ isActive }"
      to="/about"
      custom
    >
      <a
        :class="{ active: isActive }"
        href="/about"
      >
        About
      </a>
    </NuxtLink>
    <NuxtLink to="/contact">
      Contact
    </NuxtLink>
  </div>
</template>

<style scoped>
.active {
  font-weight: bold;
}
</style>
