<template>
  <div class="h-screen">
    <div id="map" class="w-full h-full"></div>
    <!-- Add test button -->
    <button
      @click="addTestStation"
      class="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-primary-700"
    >
      Add Test Station
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStationsStore } from '../stores/stations'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const stationsStore = useStationsStore()
const map = ref(null)
const markers = ref([])

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Function to add a test station
const addTestStation = async () => {
  const testStation = {
    name: 'Test Charging Station',
    location: {
      type: 'Point',
      coordinates: [0, 0], // [longitude, latitude]
    },
    status: 'active',
    powerOutput: 50,
    connectorType: 'Type 2',
  }

  const result = await stationsStore.createStation(testStation)
  if (result.success) {
    // Center map on the new station
    map.value.setView([0, 0], 13)
  }
}

const initMap = () => {
  // Get map configuration from environment variables
  const centerLat = import.meta.env.VITE_MAP_CENTER_LAT || 0
  const centerLng = import.meta.env.VITE_MAP_CENTER_LNG || 0
  const zoom = import.meta.env.VITE_MAP_ZOOM || 2

  // Initialize the map
  map.value = L.map('map').setView([centerLat, centerLng], zoom)

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map.value)

  // Add markers for each station
  stationsStore.stations.forEach((station) => {
    const marker = L.marker([
      station.location.coordinates[1],
      station.location.coordinates[0]
    ]).addTo(map.value)

    // Add popup with station info
    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold">${station.name}</h3>
        <p>Status: ${station.status}</p>
        <p>Connector: ${station.connectorType}</p>
        <p>Power: ${station.powerOutput} kW</p>
      </div>
    `)

    markers.value.push(marker)
  })
}

onMounted(async () => {
  await stationsStore.fetchStations()
  initMap()
})

// Update markers when stations change
watch(
  () => stationsStore.stations,
  () => {
    // Clear existing markers
    markers.value.forEach((marker) => marker.remove())
    markers.value = []

    // Add new markers
    stationsStore.stations.forEach((station) => {
      const marker = L.marker([
        station.location.coordinates[1],
        station.location.coordinates[0]
      ]).addTo(map.value)

      // Add popup with station info
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${station.name}</h3>
          <p>Status: ${station.status}</p>
          <p>Connector: ${station.connectorType}</p>
          <p>Power: ${station.powerOutput} kW</p>
        </div>
      `)

      markers.value.push(marker)
    })
  },
  { deep: true }
)
</script>

<style>
/* Leaflet map container styles */
#map {
  z-index: 1;
}

/* Leaflet popup styles */
.leaflet-popup-content {
  margin: 8px;
}

.leaflet-popup-content h3 {
  margin-bottom: 8px;
}

.leaflet-popup-content p {
  margin: 4px 0;
}
</style> 