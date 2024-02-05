<template>
  <div class="container mx-auto">
    <h1>Monthly Forecast</h1>
    <div class="flex flex-col gap-5">
      <div
        class="rounded-lg bg-slate-600/20 p-4 border border-slate-500/30 border-solid flex flex-row flex-1"
      >
        <Chart
          type="line"
          :data="monthlyForecastLineData"
          class="w-full"
          :options="{ maintainAspectRatio: false }"
        />
      </div>
      <div
        class="hidden lg:flex sticky top-24 flex-row gap-5 w-100 rounded-lg p-6 backdrop-blur-md z-10"
      >
        <span
          class="flex flex-1 text-center align-center justify-center font-medium"
        >
          Month
        </span>
        <div class="w-[1px] h-3 bg-white"></div>
        <span
          class="flex flex-1 text-center align-center justify-center font-medium"
        >
          Value
        </span>
        <div class="w-[1px] h-3 bg-white"></div>
        <span
          class="flex flex-1 text-center align-center justify-center font-medium"
        >
          Incomes
        </span>
        <div class="w-[1px] h-3 bg-white"></div>
        <span
          class="flex flex-1 text-center align-center justify-center font-medium"
        >
          Outcomes
        </span>
      </div>
      <div
        v-for="forecastEntry of forecast"
        class="flex flex-col lg:flex-row gap-5 w-100 bg-slate-800/30 border-solid border border-slate-600/30 rounded-lg p-6 backdrop-blur-md hover:bg-slate-500/30"
      >
        <div class="flex flex-1 lg:text-center lg:align-center">
          <h2 class="my-auto">
            {{ parseMonth(forecastEntry.date as string) }}
          </h2>
        </div>
        <span
          class="lg:hidden border-0 border-b pb-2 border-slate-400 border-solid"
          >Value</span
        >
        <div
          class="flex flex-1 lg:text-center lg:align-center lg:justify-center"
        >
          <h3 class="my-auto">{{ formatCurrency(forecastEntry.value) }}</h3>
        </div>
        <span
          class="lg:hidden border-0 border-b pb-2 border-slate-400 border-solid"
          >Incomes</span
        >
        <div class="flex flex-1 lg:align-center lg:justify-center">
          <div class="flex flex-col gap-3">
            <div v-for="{ entry, occurances } of forecastEntry.incomes">
              <EntryTag :entry="entry" :occurances="occurances" />
            </div>
          </div>
        </div>
        <span
          class="lg:hidden border-0 border-b pb-2 border-slate-400 border-solid"
          >Outcomes</span
        >
        <div class="flex flex-1 lg:align-center lg:justify-center">
          <div class="flex flex-col gap-3">
            <div v-for="{ entry, occurances } of forecastEntry.outcomes">
              <EntryTag :entry="entry" :occurances="occurances" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { formatCurrency, getUserCurrencySymbol } from '@/utils/helpers'

const props = defineProps<{ forecast: ForecastDateObject[] }>()
const { forecast } = toRefs(props)

const monthlyForecastLineData = computed(() => {
  return {
    labels: forecast.value?.map((x) => parseMonth(x.date as string)),
    datasets: [
      {
        label: `Value in ${getUserCurrencySymbol()}`,
        data: forecast.value?.map((x) => x.value) ?? [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
      },
    ],
  }
})

const parseMonth = (date: string): string => {
  const currentDate = new Date()
  const inputDate = new Date(date)
  const inputMonth = inputDate.getMonth()
  const currentMonth = currentDate.getMonth()
  const inputYear = inputDate.getFullYear()

  if (inputMonth === currentMonth && inputYear === currentDate.getFullYear()) {
    return 'This Month'
  } else if (
    inputMonth === currentMonth + 1 &&
    inputYear === currentDate.getFullYear()
  ) {
    return 'Next Month'
  } else {
    return inputDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })
  }
}
</script>
