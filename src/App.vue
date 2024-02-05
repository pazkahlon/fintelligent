<template>
  <AppMenu />
  <main class="mt-8 flex flex-1">
    <RouterView />
  </main>
</template>
<script setup lang="ts"></script>

<style>
html {
  font-size: 14px;
}
body {
  padding: 1rem;
  margin: 0;
}
#app {
  min-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}
</style>
