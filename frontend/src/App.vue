<script setup>
import { useAuthStore } from './stores/auth'
import { onMounted, ref } from 'vue'

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-primary-600 hover:text-primary-700">
                EVolt
              </router-link>
            </div>
            <!-- Desktop Navigation -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
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

          <!-- Desktop User Menu -->
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

          <!-- Mobile menu button (always visible on mobile) -->
          <div class="flex items-center sm:hidden">
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span class="sr-only">Open main menu</span>
              <!-- Icon when menu is closed -->
              <svg
                v-if="!isMobileMenuOpen"
                class="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Icon when menu is open -->
              <svg
                v-else
                class="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu (absolute, full width, high z-index) -->
      <div v-if="isMobileMenuOpen" class="sm:hidden absolute w-full bg-white shadow-lg border-b border-gray-200 z-50">
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            to="/"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="[$route.path === '/' ? 'border-primary-500 text-primary-700 bg-primary-50' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700']"
            @click="isMobileMenuOpen = false"
          >
            Home
          </router-link>
          <router-link
            to="/stations"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="[$route.path === '/stations' ? 'border-primary-500 text-primary-700 bg-primary-50' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700']"
            @click="isMobileMenuOpen = false"
          >
            Stations
          </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-primary-600 font-medium text-lg">
                  {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ authStore.user?.name }}</div>
              <div class="text-sm font-medium text-gray-500">{{ authStore.user?.email }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <button
              @click="authStore.logout"
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mt-16">
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

/* Mobile menu transitions */
.sm\:hidden {
  transition: all 0.3s ease-in-out;
}

/* Ensure content is visible on mobile */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Ensure mobile menu is above other content */
  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }
  
  /* Add shadow to mobile menu when open */
  nav .sm\:hidden {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}
</style>
