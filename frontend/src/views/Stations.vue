<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header with Add Station button and View Toggle -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Charging Stations</h1>
      <div class="flex items-center space-x-4">
        <div class="flex rounded-md shadow-sm">
          <button
            @click="viewMode = 'table'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500',
              viewMode === 'table'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
            ]"
          >
            Table
          </button>
          <button
            @click="viewMode = 'map'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-500',
              viewMode === 'map'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
            ]"
          >
            Map
          </button>
        </div>
        <button
          @click="startSelectingCoordinates"
          class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add Station
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Connector Type</label>
          <select
            v-model="filters.connectorType"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="Tesla">Tesla</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Min Power Output (kW)</label>
          <input
            v-model.number="filters.minPower"
            type="number"
            min="0"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="stationStore.loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error Message -->
    <div v-else-if="stationStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
      {{ stationStore.error }}
    </div>

    <!-- Table View -->
    <div v-show="viewMode === 'table'" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connector Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Power Output</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="station in stationStore.stations" :key="station._id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ station.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': station.status === 'active',
                  'bg-red-100 text-red-800': station.status === 'inactive',
                }"
              >
                {{ station.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.connectorType }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ station.powerOutput }} kW</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ station.location.latitude.toFixed(4) }}, {{ station.location.longitude.toFixed(4) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="openEditModal(station)"
                class="text-primary-600 hover:text-primary-900 mr-4"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(station)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Map View -->
    <div v-if="viewMode === 'map'" style="width:100%; height:600px; min-height:600px;">
      <StationMap
        ref="mapRef"
        :center="{ lat: 28.6139, lng: 77.2090 }"
        :zoom="13"
        @coordinates-selected="handleCoordinatesSelected"
        :confirmed-coordinates="confirmedCoordinates"
      />
    </div>

    <!-- Add Station Map Overlay for Selecting Coordinates -->
    <div v-if="selectingCoordinates" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex flex-col items-center justify-center z-[9999]">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full flex flex-col items-center">
        <h2 class="text-xl font-bold mb-4">Select coordinates for station</h2>
        <div style="width:100%; height:400px; min-width:300px; min-height:300px;">
          <StationMap
            :center="{ lat: 28.6139, lng: 77.2090 }"
            :zoom="13"
            @coordinates-selected="handleCoordinatesSelected"
            :confirmed-coordinates="null"
          />
        </div>
        <button @click="cancelSelectingCoordinates" class="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>

    <!-- Confirm Coordinates Modal (for map overlay) -->
    <div v-if="showConfirmCoords && selectingCoordinates" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[10000]">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Confirm Coordinates</h2>
        <p class="mb-4">Use these coordinates for the new station?</p>
        <p class="mb-4 font-mono text-blue-700">
          Lat: {{ pendingCoordinates.latitude }}<br>
          Lng: {{ pendingCoordinates.longitude }}
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelCoordinates"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >Cancel</button>
          <button
            @click="confirmCoordinates"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >Yes, Use These</button>
        </div>
      </div>
    </div>

    <!-- Station Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[9999]">
      <div class="bg-white bg-opacity-100 rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Station' : 'Add Station' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="form.status"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Connector Type</label>
              <select
                v-model="form.connectorType"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
              >
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Tesla">Tesla</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Power Output (kW)</label>
              <input
                v-model.number="form.powerOutput"
                type="number"
                min="0"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                v-model.number="form.location.latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                v-model.number="form.location.longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
        <p class="mb-6">Are you sure you want to delete this station? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useStationStore } from '../stores/station'
import StationMap from '../components/StationMap.vue'
import { useToast } from 'vue-toastification'

const stationStore = useStationStore()
const toast = useToast()

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