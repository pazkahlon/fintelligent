import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EntryDialog from '@/components/EntryDialog.vue'

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

describe('EntryDialog.vue', () => {
  it('doesnt submit form with invalid values', async () => {
    // Spy on post requests
    const postSpy = vi.spyOn(axios, 'post')

    const wrapper = mount(EntryDialog, {
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
        editedEntry: null,
      },
    })

    await nextTick()

    expect(wrapper.find('.p-dialog').exists()).toBe(true)

    const dropdownIntervalParent = wrapper.get('#reccuring_frequency_interval')
      .element.parentElement
    const dropdownGroupParent = wrapper.get('#reccuring_frequency_group')
      .element.parentElement

    // 1st case: submit an empty form with recurrance off
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#entry_name').classes()).toContain('p-invalid')
    expect(wrapper.get('#entry_amount').classes()).toContain('p-invalid')
    expect(wrapper.get('#occurs_on').classes()).toContain('p-invalid')

    expect(dropdownIntervalParent?.classList.contains('p-invalid')).toBe(false)
    expect(dropdownGroupParent?.classList.contains('p-invalid')).toBe(false)
    expect(wrapper.get('#reccuring_frequency_start').classes()).not.toContain(
      'p-invalid'
    )

    // 2nd case: submit an empty form with recurrance on
    await wrapper.get('#is_reccuring').trigger('change')

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#entry_name').classes()).toContain('p-invalid')
    expect(wrapper.get('#entry_amount').classes()).toContain('p-invalid')
    expect(dropdownIntervalParent?.classList.contains('p-invalid')).toBe(true)
    expect(dropdownGroupParent?.classList.contains('p-invalid')).toBe(true)

    expect(wrapper.get('#occurs_on').classes()).not.toContain('p-invalid')

    expect(postSpy).not.toHaveBeenCalled()

    // Clear spy
    postSpy.mockRestore()
  })

  it('submits form with valid values', async () => {
    // Spy on post requests
    const postSpy = vi.spyOn(axios, 'post')

    const wrapper = mount(EntryDialog, {
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
        editedEntry: null,
      },
    })

    await nextTick()

    expect(wrapper.find('.p-dialog').exists()).toBe(true)

    await wrapper.get('#entry_name').setValue('Valid Name')

    await wrapper.get('#entry_amount').setValue(100)
    await wrapper.get('#entry_amount').trigger('blur')

    await wrapper.get('#occurs_on').trigger('click')
    wrapper
      .get('.p-datepicker-calendar td > span:not(.p-disabled)')
      .trigger('click')

    await wrapper.get('form').trigger('submit')

    expect(postSpy).toHaveBeenCalledWith(
      '/create-entry',
      expect.objectContaining({
        name: 'Valid Name',
        amount: 100,
        occurs_on: expect.anything(),
      })
    )

    // Clear spy
    postSpy.mockRestore()
  })
})
