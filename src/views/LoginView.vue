<template>
  <div class="mx-auto mt-10 text-center">
    <h1>Welcome back!</h1>
    <div class="flex justify-center">
      <form @submit.prevent="onSubmit" class="flex flex-col gap-2 text-left">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="text"
          aria-describedby="text-error"
          :feedback="false"
          :class="!formStates.email && 'p-invalid'"
          toggleMask
        />
        <label for="password">Password</label>
        <Password
          inputId="password"
          v-model="password"
          :feedback="false"
          :input-class="!formStates.password ? 'p-invalid' : ''"
          toggleMask
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

const authStore = useAuthStore()

const email = ref<string>('')
const password = ref<string>('')

const formStates = ref<Record<string, boolean>>({
  email: true,
  password: true,
})

const stateCheck = (): boolean => {
  // Reset states
  Object.keys(formStates.value).forEach((k) => (formStates.value[k] = true))

  if (email.value.trim().length === 0) {
    formStates.value.email = false
  }

  if (password.value.trim().length === 0) {
    formStates.value.password = false
  }

  return Object.values(formStates.value).reduce((p, v) => p && v)
}

const onSubmit = () => {
  if (!stateCheck()) return
  authStore.login({
    email: email.value,
    password: password.value,
  })
}
</script>
