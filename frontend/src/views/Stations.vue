<template>
  <div class="space-y-6">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Charging Stations</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage and monitor your charging stations
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
          Add Station
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            v-model="filters.status"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label for="connectorType" class="block text-sm font-medium text-gray-700">Connector Type</label>
          <select
            id="connectorType"
            v-model="filters.connectorType"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>
        </div>

        <div>
          <label for="minPower" class="block text-sm font-medium text-gray-700">Min Power (kW)</label>
          <input
            type="number"
            id="minPower"
            v-model="filters.minPower"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            min="0"
            step="1"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Stations Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connector
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Power
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="station in filteredStations" :key="station._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ station.name }}
                      <span v-if="station.createdBy" class="text-xs text-gray-500 ml-2">
                        by {{ station.createdBy.name }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-500">{{ station.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': station.status === 'available',
                    'bg-yellow-100 text-yellow-800': station.status === 'in_use',
                    'bg-red-100 text-red-800': station.status === 'maintenance'
                  }"
                >
                  {{ station.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ station.connectorType }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ station.powerOutput }} kW
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ station.location }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div v-if="station.canModify" class="flex space-x-2 justify-end">
                  <button
                    @click="openEditModal(station)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(station)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
                <span v-else class="text-gray-500">View only</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      v-if="showModal"
      :title="isEditing ? 'Edit Station' : 'Add Station'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            v-model="form.location"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="connectorType" class="block text-sm font-medium text-gray-700">Connector Type</label>
            <select
              id="connectorType"
              v-model="form.connectorType"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="Type 2">Type 2</option>
              <option value="CCS">CCS</option>
              <option value="CHAdeMO">CHAdeMO</option>
            </select>
          </div>

          <div>
            <label for="powerOutput" class="block text-sm font-medium text-gray-700">Power Output (kW)</label>
            <input
              type="number"
              id="powerOutput"
              v-model="form.powerOutput"
              required
              min="0"
              step="0.1"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            v-model="form.status"
            required
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useStationStore } from '../stores/station'
import { useAuthStore } from '../stores/auth'
import StationMap from '../components/StationMap.vue'
import { useToast } from 'vue-toastification'
import { PlusIcon } from '@heroicons/vue/24/outline'
import Modal from '../components/Modal.vue'

const stationStore = useStationStore()
const authStore = useAuthStore()
const toast = useToast()

// Computed property to check if user is admin
const isAdmin = computed(() => authStore.userRole === 'admin')

// Computed property to check if user can modify a station
const canModifyStation = (station) => {
  return isAdmin.value || station.createdBy === authStore.user?.id
}

// State
const viewMode = ref('table')
const mapRef = ref(null)
const filters = ref({
  status: '',
  connectorType: '',
  minPower: null,
})

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const stationToDelete = ref(null)

const form = ref({
  name: '',
  status: 'active',
  connectorType: 'Type 2',
  powerOutput: 0,
  location: {
    latitude: 0,
    longitude: 0,
  },
})

const pendingCoordinates = ref({ latitude: 0, longitude: 0 })
const showConfirmCoords = ref(false)
const confirmedCoordinates = ref(null)

const selectingCoordinates = ref(false)

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    status: 'active',
    connectorType: 'Type 2',
    powerOutput: 0,
    location: {
      latitude: 0,
      longitude: 0,
    },
  }
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (station) => {
  isEditing.value = true
  form.value = { ...station }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  confirmedCoordinates.value = null
}

const confirmDelete = (station) => {
  stationToDelete.value = station
  showDeleteModal.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      const result = await stationStore.updateStation(form.value._id, form.value)
      if (result.success) {
        toast.success('Station updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update station')
      }
    } else {
      const result = await stationStore.createStation(form.value)
      if (!result.success) {
        toast.error(result.error || 'Failed to create station')
        return
      }
      toast.success('Station created successfully!')
      const newStation = result.data
      confirmedCoordinates.value = {
        latitude: newStation.location.latitude,
        longitude: newStation.location.longitude
      }
    }
    closeModal()
    await fetchStations()
  } catch (error) {
    console.error('Error in handleSubmit:', error)
    toast.error('An error occurred while saving the station')
  }
}

const handleDelete = async () => {
  if (stationToDelete.value) {
    try {
      const result = await stationStore.deleteStation(stationToDelete.value._id)
      if (result.success) {
        toast.success('Station deleted successfully!')
      } else {
        toast.error(result.error || 'Failed to delete station')
      }
      showDeleteModal.value = false
      stationToDelete.value = null
      await fetchStations()
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast.error('An error occurred while deleting the station')
    }
  }
}

const fetchStations = async () => {
  try {
    console.log('Fetching stations with filters:', filters.value)
    const result = await stationStore.fetchStations(filters.value)
    if (!result.success) {
      console.error('Failed to fetch stations:', result.error)
      toast.error(result.error || 'Failed to fetch stations')
    }
  } catch (error) {
    console.error('Error in fetchStations:', error)
    toast.error('An error occurred while fetching stations')
  }
}

// Handle map add station
const handleCoordinatesSelected = ({ latitude, longitude }) => {
  pendingCoordinates.value = { latitude, longitude }
  showConfirmCoords.value = true
}

const startSelectingCoordinates = () => {
  selectingCoordinates.value = true
  confirmedCoordinates.value = null
}

const cancelSelectingCoordinates = () => {
  selectingCoordinates.value = false
  confirmedCoordinates.value = null
}

const confirmCoordinates = () => {
  form.value.location.latitude = pendingCoordinates.value.latitude
  form.value.location.longitude = pendingCoordinates.value.longitude
  selectingCoordinates.value = false // Hide the map overlay
  showModal.value = true
  showConfirmCoords.value = false
}

const cancelCoordinates = () => {
  showConfirmCoords.value = false; // Just close the confirmation dialog
  confirmedCoordinates.value = null;
  // Do NOT set selectingCoordinates.value = false here
}

// Watch for viewMode changes to invalidate map size
watch(viewMode, async (newVal) => {
  if (newVal === 'map') {
    await nextTick();
    setTimeout(() => {
      if (mapRef.value && mapRef.value.map && mapRef.value.map.invalidateSize) {
        mapRef.value.map.invalidateSize();
      }
    }, 200);
  }
});

// Lifecycle
onMounted(async () => {
  try {
    console.log('Fetching stations...')
    const result = await stationStore.fetchStations(filters.value)
    if (!result.success) {
      console.error('Failed to fetch stations:', result.error)
      toast.error(result.error || 'Failed to fetch stations')
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
    toast.error('An error occurred while fetching stations')
  }
})

// Watch for filter changes
watch(filters, async (newFilters) => {
  try {
    console.log('Filters changed, fetching stations with:', newFilters)
    const result = await stationStore.fetchStations(newFilters)
    if (!result.success) {
      console.error('Failed to fetch stations with filters:', result.error)
      toast.error(result.error || 'Failed to fetch stations')
    }
  } catch (error) {
    console.error('Error in filter watch:', error)
    toast.error('An error occurred while fetching stations')
  }
}, { deep: true })
</script>

<style scoped>
/* Add responsive styles */
@media (max-width: 640px) {
  .table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  td, th {
    min-width: 120px;
  }
  
  td:first-child, th:first-child {
    min-width: 200px;
  }
}
</style> 