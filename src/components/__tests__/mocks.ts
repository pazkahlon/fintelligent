import { useAuthStore } from '@/stores/auth'
import type { Pinia } from 'pinia'

// Mock user
const mockUser: User = {
  id: 1,
  email: 'test@email.com',
  created_at: 1,
  display_name: 'Test User',
  display_currency: 'ILS',
  start_amount: 100,
}

export const mockLoggedInStore = (pinia: Pinia) => {
  const authStore = useAuthStore(pinia)
  // set logged in state
  authStore.user = mockUser
  authStore.authState = true
  return authStore
}
