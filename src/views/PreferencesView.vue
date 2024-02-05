<template>
  <div class="surface-section mx-auto mt-8 px-4 py-8 md:px-6 lg:px-8">
    <form
      @submit.prevent="updatePreferences"
      class="flex flex-col gap-2 text-left"
    >
      <label for="display_name">Display Name</label>
      <InputText v-model="formValues.display_name" id="display_name" />
      <label for="start_amount">Starting Amount</label>
      <InputNumber v-model="formValues.start_amount" inputId="start_amount" />
      <label for="display_currency">Display Currency</label>
      <Dropdown
        v-model="formValues.display_currency"
        :options="currencySymbols"
        optionLabel="name"
        optionValue="code"
      />
      <Button type="submit">Apply changes</Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getCurrencySymbol } from '@/utils/helpers'
const authStore = useAuthStore()

const formValues = ref({
  display_name: authStore.user!.display_name,
  start_amount: authStore.user!.start_amount,
  display_currency: authStore.user!.display_currency,
} as UserPreferences)

const supportedCurrencies = Intl.supportedValuesOf('currency')

const currencySymbols = ref(
  supportedCurrencies.map((currencyCode) => ({
    code: currencyCode,
    symbol: getCurrencySymbol(currencyCode),
    name: `${currencyCode} (${getCurrencySymbol(currencyCode)})`,
  }))
)

const updatePreferences = () => {
  authStore.updatePreferences(formValues.value)
}
</script>
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
