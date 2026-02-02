import axios from 'axios'
import { debugLog } from '@/lib/debug'

// API Configuration
// In development: Use backend directly at http://localhost:8000/api
// In production: Use VITE_API_BASE_URL from .env or relative /api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

debugLog('[API Client] Configuration:', {
  baseURL,
  isDev: import.meta.env.DEV,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  mode: import.meta.env.MODE,
})

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Log all requests for debugging
apiClient.interceptors.request.use(
  (config) => {
    debugLog('[API Client] Making request:', {
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      url: config.url,
      fullURL: (config.baseURL || '') + (config.url || ''),
    })
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
