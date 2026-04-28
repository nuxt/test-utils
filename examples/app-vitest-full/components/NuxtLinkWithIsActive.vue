<template>
  <div>
    <NuxtLink to="/">
      Home
    </NuxtLink>
    <NuxtLink
      v-slot="{ isActive, isExactActive }"
      to="/about"
      custom
    >
      <a
        :class="{ active: isActive }"
        href="/about"
        :data-is-active="isActive"
        :data-is-exact-active="isExactActive"
      >
        About
      </a>
    </NuxtLink>
    <NuxtLink
      v-slot="{ isActive, isExactActive }"
      to="/about/team"
      custom
    >
      <a
        :class="{ active: isActive }"
        href="/about/team"
        :data-is-active="isActive"
        :data-is-exact-active="isExactActive"
      >
        About Team
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
