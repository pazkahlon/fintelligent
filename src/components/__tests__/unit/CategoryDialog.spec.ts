import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CategoryDialog from '@/components/CategoryDialog.vue'

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

// Mock store in a logged in state
const pinia = createTestingPinia({
  createSpy: vi.fn,
})
const authStore = mockLoggedInStore(pinia) // Initialize auth store

describe('CategoryDialog.vue', () => {
  it('doesnt submit form with invalid name', async () => {
    // Spy on post requests
    const postSpy = vi.spyOn(axios, 'post')

    const wrapper = mount(CategoryDialog, {
      global: {
        plugins: [pinia, [PrimeVue, { ripple: true }], router],
        provide: {
          axios,
        },
        directives: {
          Ripple,
          Tooltip,
        },
        stubs: {
          teleport: true,
        },
      },
      props: {
        editedCategory: null,
      },
    })

    await nextTick()

    expect(wrapper.find('.p-dialog').exists()).toBe(true)

    await wrapper.get('#category_name').setValue('    ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('#category_name').classes()).toContain('p-invalid')

    await wrapper.get('#category_name').setValue(null)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('#category_name').classes()).toContain('p-invalid')

    expect(postSpy).not.toHaveBeenCalled()

    // Clear spy
    postSpy.mockRestore()
  })

  it('submits form with valid name', async () => {
    // Spy on post requests
    const postSpy = vi.spyOn(axios, 'post')

    const wrapper = mount(CategoryDialog, {
      global: {
        plugins: [pinia, [PrimeVue, { ripple: true }], router],
        provide: {
          axios,
        },
        directives: {
          Ripple,
          Tooltip,
        },
        stubs: {
          teleport: true,
        },
      },
      props: {
        editedCategory: null,
      },
    })

    await nextTick()

    expect(wrapper.find('.p-dialog').exists()).toBe(true)

    await wrapper.get('#category_name').setValue('Valid Name')
    await wrapper.get('form').trigger('submit')

    expect(postSpy).toHaveBeenCalledWith(
      '/create-category',
      expect.objectContaining({
        name: 'Valid Name',
        color: expect.anything(),
        icon: expect.anything(),
      })
    )

    // Clear spy
    postSpy.mockRestore()
  })
})
