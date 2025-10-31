<template>
  <div>
    Css Module
    <span
      id="s1"
      :class="$style.class1"
    />
    <span
      id="s2"
      :class="$style.class1"
    />
    <span id="s3" />
  </div>
</template>

<style module>
.class1 {
  color: red;
}
.class2 {
  color: blue;
}
</style>
