<script setup>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-primary-600 hover:text-primary-700">
                EVolt
              </router-link>
            </div>
            <div class="flex sm:ml-6 sm:space-x-8">
              <router-link
                to="/"
                class="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-primary-500 text-gray-900"
              >
                Home
              </router-link>
              <router-link
                to="/stations"
                class="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-primary-500 text-gray-900"
              >
                Stations
              </router-link>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative">
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">{{ authStore.user?.name }}</span>
                <button
                  @click="authStore.logout"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
/* Tailwind CSS is now handled by PostCSS */

/* Custom styles for delete toast */
.delete-toast {
  background-color: #FEE2E2 !important;
  border-left: 4px solid #DC2626 !important;
}

.delete-toast-body {
  color: #991B1B !important;
}

.Vue-Toastification__toast--success.delete-toast {
  background-color: #FEE2E2 !important;
  border-left: 4px solid #DC2626 !important;
}

.Vue-Toastification__toast--success.delete-toast .Vue-Toastification__toast-body {
  color: #991B1B !important;
}
</style>
