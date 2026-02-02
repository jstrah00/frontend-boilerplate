import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { apiClient } from './client'
import { toast } from 'sonner'
import { debugLog, debugWarn, debugError } from '@/lib/debug'

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
    // Add Authorization header from localStorage as fallback
    const token = localStorage.getItem('access_token')
    debugLog('[Interceptor] Request:', {
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
    })
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      debugLog('[Interceptor] Authorization header set')
    } else {
      debugWarn('[Interceptor] No token found in localStorage!')
    }
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

    // Handle 401 errors (Unauthorized) - Token refresh logic
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      debugLog('[Interceptor] 401 error detected, attempting token refresh...')

      if (isRefreshing) {
        debugLog('[Interceptor] Token refresh already in progress, queueing request...')
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          debugError('[Interceptor] No refresh token available')
          throw new Error('No refresh token available')
        }

        debugLog('[Interceptor] Refreshing token...')

        // Attempt to refresh the token
        // Note: We need to clear the Authorization header for this request
        // to avoid sending an expired token
        const response = await apiClient.post(
          '/v1/auth/refresh',
          { refresh_token: refreshToken },
          {
            headers: {
              Authorization: '', // Don't send expired token for refresh
            },
          }
        )

        const newAccessToken = response.data.access_token
        const newRefreshToken = response.data.refresh_token

        if (newAccessToken) {
          debugLog('[Interceptor] Token refreshed successfully')
          localStorage.setItem('access_token', newAccessToken)
          // Update the Authorization header for the retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
        }
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }

        processQueue(null)
        return apiClient(originalRequest)
      } catch (refreshError) {
        debugError('[Interceptor] Token refresh failed:', refreshError)
        processQueue(refreshError as Error)
        // Clear auth data and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 errors (Forbidden) - Redirect to unauthorized page
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }

    // Global error toast
    const errorMessage =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'An error occurred'

    // Don't show toast for auth errors (login failures, token refresh, etc.)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/')
    const is401 = error.response?.status === 401

    if (!is401 && !isAuthEndpoint) {
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default apiClient
