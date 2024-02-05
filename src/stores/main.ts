import { defineStore } from 'pinia'
export const useMainStore = defineStore('main', {
  state: () => ({
    entries: [] as Entry[],
    categories: [] as Category[],
  }),
  actions: {
    addEntry(entry: Entry) {
      this.entries.push(entry)
    },
    editEntry(entry: Entry, newEntry: Entry) {
      const i = this.entries.indexOf(entry)
      this.entries[i] = newEntry
    },
    deleteEntry(entry: Entry) {
      const i = this.entries.indexOf(entry)
      this.entries.splice(i, 1)
    },
    addCategory(category: Category) {
      this.categories.push(category)
    },
    editCategory(category: Category, newCategory: Category) {
      const i = this.categories.indexOf(category)
      this.categories[i] = newCategory
    },
    deleteCategory(category: Category) {
      const i = this.categories.indexOf(category)
      this.categories.splice(i, 1)
    },
  },
})
