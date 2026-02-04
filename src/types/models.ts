/**
 * Shared type definitions for the application.
 *
 * These types are manually maintained until backend OpenAPI type generation
 * is configured. When `npm run generate:types` works with your backend,
 * move to using generated types from `./generated/api.ts` instead.
 */

// =============================================================================
// User & Auth Types
// =============================================================================

export interface User {
  id: string | number
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  is_admin: boolean
  permissions?: string[]
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

// =============================================================================
// Item Types
// =============================================================================

export interface Item {
  id: string
  title: string
  description?: string
  owner_id: string
  owner_email?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ItemsListResponse {
  items: Item[]
  total: number
  skip: number
  limit: number
}

export interface ItemsListParams {
  skip?: number
  limit?: number
}

// =============================================================================
// Users Admin Types
// =============================================================================

export interface UsersListResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

export interface UsersListParams {
  skip?: number
  limit?: number
}

// =============================================================================
// Profile Types (alias for User in profile context)
// =============================================================================

export type UserProfile = User
