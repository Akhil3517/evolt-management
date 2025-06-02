import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'
import { useStationStore } from './station'

// Ensure the API URL is properly formatted with https://
const API_URL = import.meta.env.VITE_API_URL?.startsWith('http') 
  ? import.meta.env.VITE_API_URL 
  : `https://${import.meta.env.VITE_API_URL}`

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
  },

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        })

        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed',
        }
      }
    },

    async register(name, email, password) {
      try {

        if (!name || !email || !password) {
          return {
            success: false,
            error: 'All fields are required',
          }
        }

        if (password.length < 6) {
          return {
            success: false,
            error: 'Password must be at least 6 characters long',
          }
        }

        if (!email.includes('@')) {
          return {
            success: false,
            error: 'Please enter a valid email address',
          }
        }

        const response = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
        })

        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', response.data.token)

        return { success: true }
      } catch (error) {
        // Handle validation errors from the server
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors
          const errorMessage = validationErrors.map(err => err.msg).join(', ')
          return {
            success: false,
            error: errorMessage,
          }
        }
        
        return {
          success: false,
          error: error.response?.data?.message || 'Registration failed',
        }
      }
    },

    async fetchUser() {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.user = response.data.user
        return { success: true }
      } catch (error) {
        this.logout()
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to fetch user',
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      // Clear stations when logging out
      const stationStore = useStationStore()
      stationStore.stations = []
      stationStore.currentStation = null
      router.push('/login')
    },
  },
}) 