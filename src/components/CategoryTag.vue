<template>
  <Tag
    v-if="category"
    :class="`cat-${category?.color ?? 'none'} shadow-md shadow-black/40`"
    :value="category.name"
    :icon="category.icon ? `pi pi-${category.icon}` : undefined"
  />
  <Tag
    v-else
    value="None"
    class="bg-transparent border border-slate-300 text-slate-300 border-solid"
  />
</template>
<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{ category: Category | null }>()
const { category } = toRefs(props)
</script>
<style scoped lang="scss">
$background-colors: (
  'red': rgb(169, 31, 31),
  'orange': rgb(194, 110, 0),
  'yellow': rgb(255, 255, 66),
  'green': rgb(35, 120, 35),
  'blue': rgb(63, 82, 202),
  'indigo': rgb(82, 42, 134),
  'violet': rgb(237, 156, 237),
  'none': #32d399,
);

$text-colors: (
  'red': white,
  'orange': white,
  'yellow': black,
  'green': white,
  'blue': white,
  'indigo': white,
  'violet': black,
  'none': black,
);

@each $color-name, $bg-color in $background-colors {
  $text-color: map-get($text-colors, $color-name);

  .cat-#{$color-name} {
    background-color: $bg-color;
    color: $text-color;
  }
}
</style>
