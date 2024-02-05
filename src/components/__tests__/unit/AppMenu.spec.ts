import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppMenu from '@/components/AppMenu.vue'

import { mockLoggedInStore } from '../mocks'
import { createTestingPinia } from '@pinia/testing'

import router from '@/router'
import PrimeVue from 'primevue/config'
import axios from 'axios'

// Mock directives
const Ripple = {}
const Tooltip = {}

// Mock axios instance
vi.mock('axios', async (importActual) => {
  const actual = await importActual<typeof import('axios')>()

  const mockAxios = {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        ...actual.default.create(),
        get: vi.fn(),
        post: vi.fn(),
      })),
    },
  }

  return mockAxios
})

describe('AppMenu.vue', () => {
  it('shows register/login buttons and no menu items when logged out', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    })

    // Logged out by default

    const wrapper = mount(AppMenu, {
      global: {
        plugins: [pinia, [PrimeVue, { ripple: true }], router],
        provide: {
          axios,
        },
        directives: {
          Ripple,
          Tooltip,
        },
      },
    })

    expect(wrapper.find('.register-btn').exists()).toBe(true)
    expect(wrapper.find('.login-btn').exists()).toBe(true)

    // Expect no menu items to be shown
    expect(wrapper.find('.p-menuitem-link').exists()).toBe(false)
  })

  it('shows logout button and menu items when logged in', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    })

    const authStore = mockLoggedInStore(pinia)

    const wrapper = mount(AppMenu, {
      global: {
        plugins: [pinia, [PrimeVue, { ripple: true }], router],
        provide: {
          axios,
        },
        directives: {
          Ripple,
          Tooltip,
        },
      },
    })

    expect(wrapper.find('.logout-btn').exists()).toBe(true)
    // Expect menu items to be shown
    expect(wrapper.find('.p-menuitem-link').exists()).toBe(true)
  })
})
