<template>
  <div class="container mx-auto">
    <ConfirmPopup></ConfirmPopup>
    <Button
      label="Create Category"
      class="mb-4"
      @click="showModal(null)"
    ></Button>
    <DataTable :value="store.categories" :rowHover="true">
      <Column field="name" header="Name">
        <template #body="slotProps">
          <CategoryTag :category="slotProps.data" />
        </template>
      </Column>
      <Column field="color" header="Color"></Column>
      <Column field="icon" header="Icon">
        <template #body="slotProps">
          <i :class="`pi pi-${slotProps.data.icon}`"></i>
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
  <CategoryDialog
    v-if="isDialogVisible"
    @hide="isDialogVisible = false"
    :edited-category="editedCategory"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, inject } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useMainStore } from '@/stores/main'
import type { AxiosInstance } from 'axios'
const store = useMainStore()

const $axios = inject('axios') as AxiosInstance
const isDialogVisible = ref(false)

const editedCategory = ref<Category | null>(null)
const showModal = (category: Category | null = null) => {
  editedCategory.value = category
  isDialogVisible.value = true
}

const deleteCategory = (category: Category) => {
  $axios
    .post('/delete-category', {
      category_id: category.id,
    })
    .then((res) => {
      store.deleteCategory(category)
    })
}

const confirm = useConfirm()

const confirmDelete = (event: Event, category: Category) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this record?',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger p-button-sm',
    accept: () => {
      deleteCategory(category)
    },
    reject: () => {},
  })
}
</script>
