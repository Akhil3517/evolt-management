<template>
  <div style="position:relative; width:100%; height:100%; min-height:400px;">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-4 text-lg text-blue-700 font-semibold">Loading map...</span>
    </div>
    <div id="leaflet-map" style="position:absolute; top:0; left:0; right:0; bottom:0; width:100%; height:100%;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStationStore } from '../stores/station'

const emit = defineEmits(['coordinates-selected'])
const props = defineProps({
  confirmedCoordinates: {
    type: Object,
    default: null
  }
})
const stationStore = useStationStore()
const map = ref(null)
const selectedMarker = ref(null)
const loading = ref(true)

onMounted(async () => {
  map.value = L.map('leaflet-map', {
    center: [28.6139, 77.2090],
    zoom: 5,
    worldCopyJump: false,
    maxBounds: [
      [-85, -180],
      [85, 180]
    ],
    maxBoundsViscosity: 1.0
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)

  // Force map to resize after a short delay
  await nextTick()
  setTimeout(() => {
    map.value.invalidateSize()
  }, 200)

  // Hide spinner as soon as the map is ready (before fetching stations)
  map.value.whenReady(() => {
    loading.value = false
  })

  // Fetch and add markers after map is visible
  await stationStore.fetchStations()
  stationStore.stations.forEach(station => {
    if (
      station.location &&
      typeof station.location.latitude === 'number' &&
      typeof station.location.longitude === 'number'
    ) {
      L.marker([station.location.latitude, station.location.longitude])
        .addTo(map.value)
        .bindPopup(station.name)
    } else {
      console.warn('Invalid station location:', station)
    }
  })

  // Only emit coordinates on click, do not add marker
  map.value.on('click', function(e) {
    const { lat, lng } = e.latlng
    emit('coordinates-selected', { latitude: lat, longitude: lng })
  })
})

// Watch for confirmedCoordinates prop to add marker only after confirmation
watch(
  () => props.confirmedCoordinates,
  (coords) => {
    if (coords && coords.latitude && coords.longitude) {
      if (selectedMarker.value) {
        map.value.removeLayer(selectedMarker.value)
      }
      selectedMarker.value = L.marker([coords.latitude, coords.longitude]).addTo(map.value)
        .bindPopup(`Selected: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`).openPopup()
    } else if (selectedMarker.value) {
      map.value.removeLayer(selectedMarker.value)
      selectedMarker.value = null
    }
  }
)
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 