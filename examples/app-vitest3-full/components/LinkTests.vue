<template>
  <div>
    <NuxtLink to="/test">
      Link with string to prop
    </NuxtLink>
    <NuxtLink :to="{ path: '/test' }">
      Link with object to prop
    </NuxtLink>
  </div>
</template>
