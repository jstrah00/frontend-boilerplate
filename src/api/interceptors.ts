import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { apiClient } from './client'
import { toast } from 'sonner'
import { debugLog, debugError } from '@/lib/debug'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    debugLog('[Interceptor] Request:', {
      url: config.url,
      baseURL: config.baseURL,
      note: 'Using HttpOnly cookies for auth',
    })
    // Cookies are sent automatically by the browser (withCredentials: true)
    // No need to manually add Authorization header
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    debugError('[Interceptor] Response Error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      message: error.message,
      data: error.response?.data,
    })

    // Handle 401 errors (Unauthorized)
    // With HttpOnly cookies, the backend automatically tries to refresh the token
    // If we get a 401, it means refresh failed and user needs to login again
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      debugLog('[Interceptor] 401 error - session expired, redirecting to login')

      // Prevent retry loops
      originalRequest._retry = true

      // Redirect to login page
      // The backend will clear the cookies when user logs in again
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Handle 403 errors (Forbidden) - Redirect to unauthorized page
    if (error.response?.status === 403) {
      debugLog('[Interceptor] 403 error - insufficient permissions')
      window.location.href = '/unauthorized'
    }

    // Global error toast
    const errorMessage =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'An error occurred'

    // Don't show toast for auth errors (login failures, 401, etc.)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
    const is401 = error.response?.status === 401

    if (!is401 && !isAuthEndpoint) {
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default apiClient
