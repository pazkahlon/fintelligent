import { ref, inject, nextTick, computed } from 'vue'

import { useStorage } from '@vueuse/core'
import { useMainStore } from '@/stores/main'
import { useRouter } from 'vue-router'
import type { AxiosInstance } from 'axios'

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const $axios = inject('axios') as AxiosInstance
  const authState = useStorage('fin_auth_authenticated', false)
  const router = useRouter()
  const mainStore = useMainStore()

  const redirect = ref<string>('/dashboard')

  const user = ref<User | null>(null)

  const isLoggedIn = computed((): boolean => {
    return !!(authState.value === true && user.value)
  })

  const fetchUser = async (): Promise<void> => {
    await $axios
      .get('/auth/user')
      .then((res) => {
        const {
          user: res_user,
          entries,
          categories,
        } = res.data as {
          user: User
          entries: Entry[]
          categories: Category[]
        }
        if (!res_user) {
          return logout()
        }
        mainStore.entries = entries
        mainStore.categories = categories

        user.value = res_user
        authState.value = true
      })
      .catch((err) => {
        logout()
        authState.value = false
      })
  }

  const login = (credentials: any): void => {
    $axios.post('/auth/login', credentials).then(async () => {
      await fetchUser()

      if (redirect.value) {
        router.push(redirect.value)
      }
    })
  }

  const register = (credentials: any): void => {
    $axios.post('/auth/register', credentials).then(async () => {
      login(credentials)
    })
  }

  const logout = (): void => {
    $axios.post('/auth/logout').then(async () => {
      router.push('/')
      await nextTick()
      user.value = null
      authState.value = false
    })
  }

  const updatePreferences = (preferences: UserPreferences): void => {
    $axios.post('/auth/edit-preferences', preferences).then((res) => {
      if (!user.value) return
      user.value = {
        ...user.value,
        ...(res.data.preferences as UserPreferences),
      }
    })
  }

  return {
    register,
    fetchUser,
    authState,
    login,
    logout,
    isLoggedIn,
    updatePreferences,
    user,
  }
})
