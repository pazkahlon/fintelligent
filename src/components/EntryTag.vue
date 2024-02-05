<template>
  <span
    class="entry-tag"
    :class="`entry-cat-${entry.category?.color ?? 'none'}`"
  >
    <span
      v-if="entry.reccuring"
      class="entry-occurances flex flex-row items-center justify-center text-black text-xs px-1 font-bold gap-1"
      v-tooltip.top="
        `${occurances} occurances this month (${formatCurrency(
          entry.amount
        )}×${occurances})`
      "
    >
      <i v-if="entry.reccuring" class="pi pi-refresh text-xs"></i>
      <span v-if="entry.reccuring">({{ occurances }})</span>
    </span>
    <CategoryTag
      :category="{
        icon: entry.category?.icon,
        color: entry.category?.color,
        name: `${entry.name} | ${formatCurrency(entry.amount * occurances)}`,
      }"
    />
  </span>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import { formatCurrency } from '@/utils/helpers'

const props = defineProps<{ entry: Entry; occurances: number }>()
const { entry, occurances } = toRefs(props)
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

@each $color-name, $bg-color in $background-colors {
  .entry-cat-#{$color-name} {
    display: inline-flex;
    border-radius: 8px;
    padding: 2px;
    background-color: lighten($bg-color, 30);
  }
}
</style>
