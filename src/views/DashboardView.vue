<template>
  <div class="container mx-auto">
    <h1>{{ authStore.user!.display_name }}'s Dashboard</h1>
    <p>Get a 12 month forecast based on your entries.</p>
    <div class="flex lg:flex-row flex-col gap-6">
      <div
        class="rounded-lg bg-slate-600/20 p-4 border border-slate-500/30 border-solid flex-1"
      >
        <h2 class="p-0 m-0 mb-4">Yearly income vs outcome</h2>
        <div class="flex lg:flex-row flex-col">
          <Chart type="pie" :data="totalExpenses" class="lg:w-1/2" />
          <ul class="flex flex-col gap-4 flex-1">
            <li class="flex flex-col gap-2">
              <h2 class="m-0 p-0 font-normal text-sm">Income</h2>
              <p class="m-0 p-0 text-xl font-bold">
                {{ totalsThisYear.incomes }}
              </p>
              <h2 class="m-0 p-0 font-normal text-sm">Outcome</h2>
              <p class="m-0 p-0 text-xl font-bold">
                {{ totalsThisYear.outcomes }}
              </p>
              <h2 class="m-0 p-0 font-normal text-sm">Total</h2>
              <p class="m-0 p-0 text-xl font-bold">
                {{
                  totalsThisYear.incomes >= totalsThisYear.outcomes ? '+' : '-'
                }}
                {{ Math.abs(totalsThisYear.incomes - totalsThisYear.outcomes) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="rounded-lg bg-slate-600/20 p-4 border border-slate-500/30 border-solid flex-1"
      >
        <h2 class="p-0 m-0 mb-4">Yearly incomes by category</h2>
        <div class="flex lg:flex-row flex-col">
          <Chart
            type="pie"
            :data="totalsThisYearByCategoryChartData.income"
            class="lg:w-1/2"
          />
          <ul class="flex flex-col gap-4">
            <li
              v-for="(amount, categoryId) of totalsThisYearByCategory.incomes"
              class="flex flex-row gap-2"
            >
              <CategoryTag :category="getCategoryById(categoryId)" />
              <span>{{ formatCurrency(amount) }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="rounded-lg bg-slate-600/20 p-4 border border-slate-500/30 border-solid flex-1"
      >
        <h2 class="p-0 m-0 mb-4">Yearly outcomes by category</h2>
        <div class="flex lg:flex-row flex-col">
          <Chart
            type="pie"
            :data="totalsThisYearByCategoryChartData.outcome"
            class="lg:w-1/2"
          />
          <ul class="flex flex-col gap-4">
            <li
              v-for="(amount, categoryId) of totalsThisYearByCategory.outcomes"
              class="flex flex-row gap-2"
            >
              <CategoryTag :category="getCategoryById(categoryId)" />
              <span>{{ formatCurrency(amount) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <ForecastTable :forecast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { formatCurrency } from '@/utils/helpers'
import type { AxiosInstance } from 'axios'

import { useMainStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'

const store = useMainStore()
const authStore = useAuthStore()

// Get forecast
const forecast = ref<ForecastDateObject[]>([])
const $axios = inject('axios') as AxiosInstance

$axios.get('/get-forecast').then((res) => {
  forecast.value = res.data.forecast
})

const totalsThisYear = computed(() => {
  const totals = { incomes: 0, outcomes: 0 }
  for (const month of forecast.value) {
    for (const income of month.incomes) {
      totals.incomes += income.entry.amount * income.occurances
    }
    for (const outcome of month.outcomes) {
      totals.outcomes += outcome.entry.amount * outcome.occurances
    }
  }

  totals.incomes = Math.round(totals.incomes)
  totals.outcomes = Math.round(totals.outcomes)

  return totals
})

const getCategoryById = (id: string) => {
  return store.categories.find((c) => c.id === parseInt(id))
}

const totalsThisYearByCategory = computed(() => {
  const totals = {
    incomes: {} as Record<string, number>,
    outcomes: {} as Record<string, number>,
  }
  for (const month of forecast.value) {
    for (const income of month.incomes) {
      if (income.entry.category_id) {
        totals.incomes[income.entry.category_id] ??= 0
        totals.incomes[income.entry.category_id] +=
          income.entry.amount * income.occurances
      }
    }
    for (const outcome of month.outcomes) {
      if (outcome.entry.category_id) {
        totals.outcomes[outcome.entry.category_id] ??= 0
        totals.outcomes[outcome.entry.category_id] +=
          outcome.entry.amount * outcome.occurances
      }
    }
  }

  for (const [i, o] of Object.entries(totals.incomes)) {
    totals.incomes[i] = Math.round(o)
  }

  for (const [i, o] of Object.entries(totals.outcomes)) {
    totals.outcomes[i] = Math.round(o)
  }

  return totals
})

const categoryColors = {
  red: 'rgb(169, 31, 31)',
  orange: 'rgb(194, 110, 0)',
  yellow: 'rgb(255, 255, 66)',
  green: 'rgb(35, 120, 35)',
  blue: 'rgb(63, 82, 202)',
  indigo: 'rgb(82, 42, 134)',
  violet: 'rgb(237, 156, 237)',
  none: ' #32d399',
}

const totalsThisYearByCategoryChartData = computed(() => {
  const getValues = (object: any) => Object.values(object)
  const getNames = (object: any) =>
    Object.keys(object).map((key) => getCategoryById(key)?.name)
  const getColors = (object: any) =>
    Object.keys(object).map(
      (key) => categoryColors[getCategoryById(key)?.color ?? 'none']
    )

  return {
    income: {
      labels: getNames(totalsThisYearByCategory.value.incomes),
      datasets: [
        {
          data: getValues(totalsThisYearByCategory.value.incomes),
          backgroundColor: getColors(totalsThisYearByCategory.value.incomes),
        },
      ],
    },
    outcome: {
      labels: getNames(totalsThisYearByCategory.value.outcomes),
      datasets: [
        {
          data: getValues(totalsThisYearByCategory.value.outcomes),
          backgroundColor: getColors(totalsThisYearByCategory.value.outcomes),
        },
      ],
    },
  }
})

const totalExpenses = computed(() => ({
  labels: ['Income', 'Outcome'],
  datasets: [
    {
      data: [totalsThisYear.value.incomes, totalsThisYear.value.outcomes],
    },
  ],
}))
</script>
