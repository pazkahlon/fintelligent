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
        <span class="font-bold white-space-nowrap">New Category</span>
      </div>
    </template>
    <form
      @submit.prevent="createCategory"
      class="flex flex-col gap-2 text-left"
    >
      <label for="category_name">Name</label>
      <InputText
        v-model="formData.name"
        id="category_name"
        :class="!formStates.name && 'p-invalid'"
      />
      <label for="category_color">Color</label>
      <SelectButton
        v-model="formData.color"
        :options="colors"
        :allowEmpty="false"
        inputId="category_color"
      >
        <template #option="slotProps">
          <div class="flex align-items-center z-10">
            <CategoryTag
              :category="{ name: slotProps.option, color: slotProps.option }"
            />
          </div>
        </template>
      </SelectButton>
      <label for="category_icon">Icon</label>
      <SelectButton
        v-model="formData.icon"
        :options="icons"
        aria-labelledby="basic"
        inputId="category_icon"
      >
        <template #option="slotProps">
          <div class="flex align-items-center">
            <i :class="`pi pi-${slotProps.option}`"></i>
          </div>
        </template>
      </SelectButton>
      <Button label="Discard" link @click="visible = false" autofocus />
      <Button
        v-if="!editedCategory"
        type="submit"
        label="Add Category"
        icon="pi pi-plus"
        autofocus
      />
      <Button
        v-else
        label="Edit Category"
        icon="pi pi-pencil"
        @click="editCategory"
      />
    </form>
    <template #footer> </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, inject, toRefs, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import type { AxiosInstance } from 'axios'

const emit = defineEmits(['entry', 'hide'])
const store = useMainStore()
const visible = ref(true)

// Defining initial form data & options

const formData = ref({
  name: '' as string,
  color: 'blue' as Category['color'],
  icon: '' as string | null,
})

const formStates = ref<Record<string, boolean>>({
  name: true,
  color: true,
  icon: true,
})

const stateCheck = (): boolean => {
  // Reset states
  Object.keys(formStates.value).forEach((k) => (formStates.value[k] = true))

  if (formData.value.name.trim().length === 0) {
    formStates.value.name = false
  }

  return Object.values(formStates.value).reduce((p, v) => p && v)
}

const colors = ref([
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
])

const icons = ref([
  'heart-fill',
  'star-fill',
  'bolt',
  'money-bill',
  'shopping-bag',
  'gift',
  'flag-fill',
])

// Setting edited category if exists

const props = defineProps<{ editedCategory: Category | null }>()
const { editedCategory } = toRefs(props)

if (editedCategory.value) {
  formData.value = {
    ...editedCategory.value,
  }
}

// API actions

const $axios = inject('axios') as AxiosInstance

const createCategory = () => {
  if (!stateCheck()) return
  $axios.post('/create-category', formData.value).then((res) => {
    store.addCategory(res.data.category)
    visible.value = false
  })
}

const editCategory = () => {
  if (!stateCheck()) return
  const category = editedCategory.value as Category
  $axios.post('/edit-category', formData.value).then((res) => {
    store.editCategory(category, res.data.category)
    visible.value = false
  })
}
</script>
