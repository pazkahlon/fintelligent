<template>
  <div class="container mx-auto mt-5 sticky top-5 z-50">
    <Menubar
      :model="items"
      class="bg-slate-800/30 border-solid border border-slate-600/30 backdrop-blur-md p-3"
      breakpoint="1023px"
    >
      <template #start>
        <router-link to="/">
          <img
            class="h-5 mt-1 mx-3"
            src="/product-color-logo.svg"
            alt="fintelligent"
        /></router-link>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a
            v-ripple
            :href="href"
            class="rounded-md"
            :style="{
              backgroundColor:
                route.path === item.route ? 'var(--highlight-bg)' : '',
            }"
            v-bind="props.action"
            @click="navigate"
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a
          v-else
          v-ripple
          :href="item.url"
          class="rounded-md"
          :target="item.target"
          v-bind="props.action"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
        </a>
      </template>
      <template #end>
        <div v-if="!authStore.isLoggedIn" class="flex items-center gap-2">
          <router-link to="/login">
            <router-link to="/register">
              <Button
                link
                label="Register"
                icon="pi pi-user"
                class="register-btn font-bold px-5 py-3"
              ></Button>
            </router-link>
            <Button
              link
              label="Login"
              icon="pi pi-user"
              class="login-btn font-bold px-5 py-3"
            ></Button>
          </router-link>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="font-medium hidden sm:block"
            >Hello, {{ authStore.user!.display_name }}</span
          >
          <Button
            link
            label="Logout"
            icon="pi pi-user"
            class="logout-btn font-bold px-5 py-3"
            @click="authStore.logout"
          ></Button>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import type { MenuItem } from 'primevue/menuitem'

const route = useRoute()
const authStore = useAuthStore()

const items = computed((): MenuItem[] => {
  if (authStore.isLoggedIn) {
    return [
      {
        label: 'Dashboard',
        icon: 'pi pi-th-large',
        route: '/dashboard',
      },
      {
        label: 'Your Entries',
        icon: 'pi pi-star',
        route: '/entries',
      },
      {
        label: 'Categories',
        icon: 'pi pi-list',
        route: '/categories',
      },
      {
        label: 'Preferences',
        icon: 'pi pi-cog',
        route: '/preferences',
      },
    ]
  }
  return []
})
</script>
