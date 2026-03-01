<template>
  <main>
    <h1>Accessible Page</h1>
    <p>This page has no accessibility violations.</p>
    <nav aria-label="Main navigation">
      <ul>
        <li><NuxtLink to="/violations">Violations</NuxtLink></li>
        <li><NuxtLink to="/interactive">Interactive</NuxtLink></li>
      </ul>
    </nav>
  </main>
</template>
