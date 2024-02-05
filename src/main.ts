import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-dark-green/theme.css'
import 'primeicons/primeicons.css'

import ConfirmationService from 'primevue/confirmationservice'
import Ripple from 'primevue/ripple'
import Tooltip from 'primevue/tooltip'

import axios from 'axios'
axios.defaults.withCredentials = true

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { ripple: true })
app.use(ConfirmationService)
app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)
app.provide('axios', axiosInstance)

const authStore = useAuthStore()

let isInitialLoad = true
router.beforeEach(async (to, from) => {
  // Ensure login
  if (isInitialLoad && authStore.authState === true) {
    isInitialLoad = false
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      path: '/login',
    }
  }

  if (to.meta.guestsOnly && authStore.isLoggedIn) {
    return {
      path: '/',
    }
  }
})

app.mount('#app')
