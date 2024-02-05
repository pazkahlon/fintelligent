<template>
  <div class="surface-section mx-auto mt-8 px-4 py-8 md:px-6 lg:px-8">
    <div class="text-700 text-center">
      <div class="text-900 font-bold text-9xl mb-3">🪙 💵 ✨</div>
      <div class="text-900 font-bold text-5xl mt-8 mb-3">
        Control your money.
      </div>
      <div class="text-700 text-2xl mb-5">
        Introducing a platform for tracking your monthly cash flow
      </div>
      <RouterLink to="/dashboard">
        <Button
          label="Start now!"
          icon="pi pi-star-fill"
          class="font-bold px-5 py-3"
        ></Button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style scoped lang="scss">
.p-menuitem-link {
  border-radius: 6px;
}
.p-submenu-list .p-menuitem-link {
  border-radius: 0;
}

:deep(.p-submenu-list) {
  @apply bg-slate-800/30 backdrop-blur-md border-solid border border-slate-600/30 rounded-md;
}
</style>
