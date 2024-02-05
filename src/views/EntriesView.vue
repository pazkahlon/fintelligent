<template>
  <div class="container mx-auto">
    <ConfirmPopup></ConfirmPopup>
    <Button label="Create Entry" class="mb-4" @click="showModal(null)"></Button>
    <DataTable :value="store.entries" :rowHover="true">
      <Column field="name" header="Name"></Column>
      <Column field="is_income" header="Type">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.is_income ? 'Income' : 'Outcome'"
            :severity="slotProps.data.is_income ? 'success' : 'danger'"
          />
        </template>
      </Column>
      <Column field="category_id" header="Category">
        <template #body="slotProps">
          <CategoryTag
            :category="
              slotProps.data.category_id ? slotProps.data.category : null
            "
          />
        </template>
      </Column>
      <Column field="amount" header="Amount">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.amount) }}
        </template>
      </Column>
      <Column field="occurs_on" header="Occurs on">
        <template #body="slotProps">
          <div v-if="!slotProps.data.reccuring">
            {{ slotProps.data.occurs_on }}
          </div>
          <div v-else>
            <i class="pi pi-refresh text-xs"></i>
            {{ parseReccurances(slotProps.data as Entry) }}
          </div>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <div class="flex flex-row gap-2">
            <Button icon="pi pi-pencil" @click="showModal(slotProps.data)" />
            <Button
              icon="pi pi-times"
              @click="confirmDelete($event, slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <EntryDialog
    v-if="isDialogVisible"
    @hide="isDialogVisible = false"
    :edited-entry="editedEntry"
  />
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useMainStore } from '@/stores/main'
import { formatCurrency } from '@/utils/helpers'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmPopup from 'primevue/confirmpopup'
import type { AxiosInstance } from 'axios'
const store = useMainStore()

const isDialogVisible = ref(false)

const $axios = inject('axios') as AxiosInstance

const editedEntry = ref<Entry | null>(null)
const showModal = (entry: Entry | null = null) => {
  editedEntry.value = entry
  isDialogVisible.value = true
}

const deleteEntry = (entry: Entry) => {
  $axios
    .post('/delete-entry', {
      entry_id: entry.id,
    })
    .then((res) => {
      store.deleteEntry(entry)
    })
}

const confirm = useConfirm()

const confirmDelete = (event: Event, entry: Entry) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this record?',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger p-button-sm',
    accept: () => {
      deleteEntry(entry)
    },
    reject: () => {},
  })
}

const parseReccurances = (entry: Entry): string => {
  if (!entry.reccuring_frequency || !entry.reccuring_frequency_start) return '-'

  const group = entry.reccuring_frequency.slice(-1) as 'd' | 'w' | 'm' | 'y'
  const interval = entry.reccuring_frequency.slice(0, -1)

  const groupMap = { d: 'days', w: 'weeks', m: 'months', y: 'years' }

  const reccuranceStart = new Date(
    entry.reccuring_frequency_start
  ).toLocaleString('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `Every ${interval} ${groupMap[group]} from ${reccuranceStart}`
}
</script>
