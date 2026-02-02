export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',
    ME: '/v1/users/me',
  },
  // Users
  USERS: {
    LIST: '/v1/users',
    DETAIL: (id: string | number) => `/v1/users/${id}`,
    CREATE: '/v1/users',
    UPDATE: (id: string | number) => `/v1/users/${id}`,
    DELETE: (id: string | number) => `/v1/users/${id}`,
    CHANGE_PASSWORD: (id: string | number) => `/v1/users/${id}/password`,
  },
  // Items
  ITEMS: {
    LIST: '/v1/items',
    DETAIL: (id: string | number) => `/v1/items/${id}`,
    CREATE: '/v1/items',
    UPDATE: (id: string | number) => `/v1/items/${id}`,
    DELETE: (id: string | number) => `/v1/items/${id}`,
  },
  // Profile
  PROFILE: {
    UPDATE: '/v1/profile',
  },
} as const
