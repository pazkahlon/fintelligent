<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    header="Header"
    class="container"
    @after-hide="emit('hide')"
  >
    <template #header>
      <div class="inline-flex align-items-center justify-content-center gap-2">
        <span class="font-bold white-space-nowrap">New Entry</span>
      </div>
    </template>
    <form @submit.prevent="createEntry" class="flex flex-col gap-2 text-left">
      <label for="entry_name">Name</label>
      <InputText
        v-model="formData.name"
        id="entry_name"
        :class="!formStates.name && 'p-invalid'"
      />
      <label for="entry_type">Type</label>
      <SelectButton
        v-model="formData.is_income"
        id="entry_type"
        :options="incomeOptions"
        optionLabel="name"
        optionValue="value"
        :allowEmpty="false"
      />
      <label for="entry_amount">Amount</label>
      <InputNumber
        v-model="formData.amount"
        inputId="entry_amount"
        :input-class="!formStates.amount ? 'p-invalid' : ''"
        mode="currency"
        :currency="authStore.user!.display_currency"
        locale="en-US"
      />
      <label for="entry_categories">Category</label>
      <Dropdown
        v-model="formData.category_id"
        :options="categoryOptions"
        showClear
        id="entry_categories"
        placeholder="Select a Category"
        optionLabel="name"
        optionValue="id"
      >
        <template #option="slotProps">
          <div class="flex align-items-center">
            <CategoryTag :category="slotProps.option" />
          </div>
        </template>
        <template #value="slotProps">
          <div class="flex align-items-center">
            <CategoryTag
              :category="categoryOptions.find((c) => c.id === slotProps.value)"
            />
          </div>
        </template>
      </Dropdown>
      <label for="occurs_on" :class="formData.reccuring && 'p-disabled'"
        >At</label
      >
      <Calendar
        v-model="formData.occurs_on"
        inputId="occurs_on"
        :input-class="!formStates.occurs_on ? 'p-invalid' : ''"
        :disabled="formData.reccuring"
      />
      <label for="is_reccuring">Reccuring?</label>
      <InputSwitch v-model="formData.reccuring" inputId="is_reccuring" />
      <InputGroup :class="!formData.reccuring && 'p-disabled'">
        <InputGroupAddon>Every</InputGroupAddon>
        <Dropdown
          v-model="formData.reccuring_frequency_interval"
          :options="reccuringIntervalsOptions"
          optionLabel="name"
          optionValue="value"
          inputId="reccuring_frequency_interval"
          :class="!formStates.reccuring_frequency_interval && 'p-invalid'"
        />
        <Dropdown
          v-model="formData.reccuring_frequency_group"
          :options="reccuringGroupsOptions"
          optionLabel="name"
          optionValue="value"
          inputId="reccuring_frequency_group"
          :class="!formStates.reccuring_frequency_group && 'p-invalid'"
        />
        <InputGroupAddon>Starting from</InputGroupAddon>
        <Calendar
          v-model="formData.reccuring_frequency_start"
          inputId="reccuring_frequency_start"
          :input-class="
            !formStates.reccuring_frequency_start ? 'p-invalid' : ''
          "
        />
      </InputGroup>
      <Button label="Discard" link @click="visible = false" autofocus />
      <Button
        v-if="!editedEntry"
        type="submit"
        label="Add Entry"
        icon="pi pi-plus"
        autofocus
      />
      <Button
        v-else
        label="Edit Entry"
        icon="pi pi-pencil"
        @click="editEntry"
      />
    </form>
    <template #footer> </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, inject, computed, toRefs } from 'vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'

import { useMainStore } from '@/stores/main'
import { useAuthStore } from '@/stores/auth'
import type { AxiosInstance } from 'axios'

const emit = defineEmits(['entry', 'hide'])
const store = useMainStore()
const authStore = useAuthStore()
const visible = ref(true)

// Defining initial form data & options

const formData = ref({
  name: '',
  is_income: true,
  category_id: null,
  amount: null,
  occurs_on: null as Date | null,
  reccuring: false,
  reccuring_frequency_interval: null as number | null,
  reccuring_frequency_group: null as string | null,
  reccuring_frequency_start: null as Date | null,
})

const formStates = ref<Record<string, boolean>>({
  name: true,
  is_income: true,
  category_id: true,
  amount: true,
  occurs_on: true,
  reccuring: true,
  reccuring_frequency_interval: true,
  reccuring_frequency_group: true,
  reccuring_frequency_start: true,
})

const stateCheck = (): boolean => {
  // Reset states
  Object.keys(formStates.value).forEach((k) => (formStates.value[k] = true))

  const values = formData.value

  if (formData.value.name.trim().length === 0) {
    formStates.value.name = false
  }

  if (!values.reccuring && values.occurs_on === null) {
    formStates.value.occurs_on = false
  }

  if (values.amount === null || values.amount === '') {
    formStates.value.amount = false
  }

  if (values.reccuring) {
    if (!values.reccuring_frequency_interval) {
      formStates.value.reccuring_frequency_interval = false
    }
    if (!values.reccuring_frequency_group) {
      formStates.value.reccuring_frequency_group = false
    }
    if (!values.reccuring_frequency_start) {
      formStates.value.reccuring_frequency_start = false
    }
  }

  return Object.values(formStates.value).reduce((p, v) => p && v)
}

const incomeOptions = ref([
  { value: true, name: 'Income' },
  { value: false, name: 'Outcome' },
])

const categoryOptions = computed(() => store.categories)
const reccuringIntervalsOptions = ref(
  Array.from({ length: 99 }, (v, i) => ({ name: i + 1, value: i + 1 }))
)
const reccuringGroupsOptions = ref([
  { value: 'd', name: 'Days' },
  { value: 'w', name: 'Weeks' },
  { value: 'm', name: 'Months' },
  { value: 'y', name: 'Years' },
])

const reccuringFrequency = computed(() => {
  if (!formData.value.reccuring) return null
  return `${formData.value.reccuring_frequency_interval}${formData.value.reccuring_frequency_group}`
})

// Setting edited entry if exists

const props = defineProps<{ editedEntry: Entry | null }>()
const { editedEntry } = toRefs(props)

if (editedEntry.value) {
  const entry: Entry = editedEntry.value

  const reccuring_frequency_interval = parseInt(
    entry.reccuring_frequency?.slice(0, -1),
    10
  )
  const reccuring_frequency_group = entry.reccuring_frequency?.slice(-1)

  formData.value = {
    ...entry,
    occurs_on: entry.occurs_on ? new Date(entry.occurs_on) : null,
    reccuring_frequency_interval,
    reccuring_frequency_group,
    reccuring_frequency_start: entry.reccuring
      ? new Date(entry.reccuring_frequency_start)
      : null,
  }
}

// API actions

const $axios = inject('axios') as AxiosInstance

const createEntry = async () => {
  if (!stateCheck()) return
  $axios
    .post('/create-entry', {
      ...formData.value,
      occurs_on: formData.value.occurs_on?.getTime() ?? null,
      reccuring_frequency: reccuringFrequency.value,
      reccuring_frequency_start:
        formData.value.reccuring_frequency_start?.getTime() ?? null,
    })
    .then((res) => {
      store.addEntry(res.data.entry)
      visible.value = false
    })
}

const editEntry = async () => {
  if (!stateCheck()) return
  const entry = editedEntry.value as Entry
  $axios
    .post('/edit-entry', {
      ...formData.value,
      occurs_on: formData.value.occurs_on?.getTime() ?? null,
      reccuring_frequency: reccuringFrequency.value,
      reccuring_frequency_start:
        formData.value.reccuring_frequency_start?.getTime() ?? null,
    })
    .then((res) => {
      store.editEntry(entry, res.data.entry)
      visible.value = false
    })
}
</script>
