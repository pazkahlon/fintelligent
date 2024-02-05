import { useAuthStore } from '@/stores/auth'

export function formatCurrency(amount: number): string {
  const authStore = useAuthStore()
  return new Intl.NumberFormat('default', {
    style: 'currency',
    currency: authStore.user?.display_currency,
  }).format(amount)
}

export function getCurrencySymbol(code: string): string {
  return new Intl.NumberFormat('default', {
    style: 'currency',
    currency: code,
  })
    .format(0)
    .replace(/[\d.,\s]/g, '')
    .trim()
}

export function getUserCurrencySymbol(): string {
  const authStore = useAuthStore()
  return getCurrencySymbol(authStore.user?.display_currency ?? '')
}
