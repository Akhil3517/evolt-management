<template>
  <div class="map-click-handler" @click="handleClick"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'

const props = defineProps({
  map: {
    type: Object,
    required: true
  },
  isAddMode: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['location-selected'])

const handleClick = (e) => {
  if (props.isAddMode && e.latlng) {
    const { lat, lng } = e.latlng
    console.log('MapClickHandler: Clicked location:', lat, lng) // Debug log
    emit('location-selected', { latitude: lat, longitude: lng })
  }
}

onMounted(() => {
  if (props.map) {
    props.map.on('click', handleClick)
  }
})

onUnmounted(() => {
  if (props.map) {
    props.map.off('click', handleClick)
  }
})
</script>

<style scoped>
.map-click-handler {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  cursor: crosshair;
}
</style> 