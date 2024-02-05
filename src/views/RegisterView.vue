<template>
  <div class="mx-auto mt-10 text-center">
    <h1>Join us!</h1>
    <div class="flex justify-center">
      <form @submit.prevent="onSubmit" class="flex flex-col gap-2 text-left">
        <label for="display_name">Display Name</label>
        <InputText
          id="display_name"
          v-model="formValues.display_name"
          type="text"
          :feedback="false"
          :class="!formStates.display_name && 'p-invalid'"
        />
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="formValues.email"
          type="text"
          :feedback="false"
          :class="!formStates.email && 'p-invalid'"
        />
        <label for="password">Password</label>
        <Password
          inputId="password"
          v-model="formValues.password"
          :feedback="false"
          :input-class="!formStates.password ? 'p-invalid' : ''"
          toggleMask
        />
        <label for="password_confirm">Confirm Password</label>
        <Password
          inputId="password_confirm"
          v-model="formValues.password_confirmation"
          :feedback="false"
          :input-class="!formStates.password_confirmation ? 'p-invalid' : ''"
          toggleMask
        />
        <label for="display_currency">Preferred Currency</label>
        <Dropdown
          v-model="formValues.display_currency"
          :options="currencySymbols"
          optionLabel="name"
          optionValue="code"
        />
        <label for="start_amount">Starting Amount</label>
        <InputNumber
          inputId="start_amount"
          v-model="formValues.start_amount"
          :feedback="false"
          :input-class="!formStates.start_amount ? 'p-invalid' : ''"
        />
        <Button type="submit" label="Submit" />
      </form>
      <Toast />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getCurrencySymbol } from '@/utils/helpers'

const authStore = useAuthStore()

const formValues = ref({
  email: '' as string,
  password: '' as string,
  password_confirmation: '' as string,
  display_name: '' as string,
  display_currency: 'USD' as string,
  start_amount: 0 as number,
})

const formStates = ref<Record<string, boolean>>({
  email: true,
  password: true,
  password_confirmation: true,
  display_name: true,
  display_currency: true,
  start_amount: true,
})

const stateCheck = (): boolean => {
  // Reset states
  Object.keys(formStates.value).forEach((k) => (formStates.value[k] = true))

  const values = formValues.value

  if (values.email.trim().length === 0) {
    formStates.value.email = false
  }

  if (values.display_name.trim().length === 0) {
    formStates.value.display_name = false
  }

  if (values.password.length === 0) {
    formStates.value.password = false
  }

  if (values.password !== values.password_confirmation) {
    formStates.value.password = false
    formStates.value.password_confirmation = false
  }

  if (values.start_amount === null) {
    formStates.value.start_amount = false
  }

  return Object.values(formStates.value).reduce((p, v) => p && v)
}

const supportedCurrencies = Intl.supportedValuesOf('currency')

const currencySymbols = ref(
  supportedCurrencies.map((currencyCode) => ({
    code: currencyCode,
    symbol: getCurrencySymbol(currencyCode),
    name: `${currencyCode} (${getCurrencySymbol(currencyCode)})`,
  }))
)

const onSubmit = () => {
  if (!stateCheck()) return
  authStore.register(formValues.value)
}
</script>
