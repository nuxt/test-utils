<template>
  <div>
    <div id="s1">
      {{ $pluginProvidedValues.value }}
    </div>
    <div id="s2">
      {{ $pluginProvidedValues.func('value') }}
    </div>
    <div id="s3">
      {{ $pluginProvidedValues.object.value }}
    </div>
  </div>
</template>
