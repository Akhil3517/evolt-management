import { defineStore } from 'pinia'
import axios from 'axios'

// Ensure the API URL is properly formatted with https://
const API_URL = import.meta.env.VITE_API_URL?.startsWith('http') 
  ? import.meta.env.VITE_API_URL 
  : `https://${import.meta.env.VITE_API_URL}`

console.log('API URL:', API_URL); // Debug log

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('Request:', config.method.toUpperCase(), config.url, config.headers)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.config?.url, error.response?.data)
    return Promise.reject(error)
  }
)

export const useStationStore = defineStore('station', {
  state: () => ({
    stations: [],
    currentStation: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeStations: (state) => state.stations.filter(station => station.status === 'active'),
    inactiveStations: (state) => state.stations.filter(station => station.status === 'inactive'),
  },

  actions: {
    async fetchStations(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        if (filters.status) params.append('status', filters.status)
        if (filters.connectorType) params.append('connectorType', filters.connectorType)
        if (filters.minPower) params.append('minPower', filters.minPower)

        const response = await api.get(`/api/stations?${params.toString()}`)
        this.stations = response.data
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch stations'
        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.loading = false
      }
    },

    async fetchStation(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/api/stations/${id}`)
        this.currentStation = response.data
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch station'
        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.loading = false
      }
    },

    async createStation(stationData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/api/stations', stationData)
        this.stations.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create station'
        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.loading = false
      }
    },

    async updateStation(id, stationData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/api/stations/${id}`, stationData)
        const index = this.stations.findIndex(station => station._id === id)
        if (index !== -1) {
          this.stations[index] = response.data
        }
        if (this.currentStation?._id === id) {
          this.currentStation = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update station'
        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.loading = false
      }
    },

    async deleteStation(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/stations/${id}`)
        this.stations = this.stations.filter(station => station._id !== id)
        if (this.currentStation?._id === id) {
          this.currentStation = null
        }
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete station'
        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.loading = false
      }
    },
  },
}) 