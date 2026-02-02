import { User } from "@/features/users/api/users.api"
import { Item } from "@/features/items/api/items.api"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    first_name: "Admin",
    last_name: "User",
    role: "admin",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    permissions: ["users:read", "users:write", "items:read", "items:write"],
  },
  {
    id: "2",
    email: "user@example.com",
    first_name: "Regular",
    last_name: "User",
    role: "user",
    status: "active",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    permissions: ["items:read", "items:write"],
  },
  {
    id: "3",
    email: "inactive@example.com",
    first_name: "Inactive",
    last_name: "User",
    role: "user",
    status: "inactive",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    permissions: [],
  },
]

export const mockItems: Item[] = [
  {
    id: "1",
    title: "First Item",
    description: "This is the first item",
    owner_id: "1",
    owner_email: "admin@example.com",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Second Item",
    description: "This is the second item",
    owner_id: "2",
    owner_email: "user@example.com",
    status: "active",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    title: "Archived Item",
    description: "This item is archived",
    owner_id: "1",
    owner_email: "admin@example.com",
    status: "archived",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
  },
]

export const mockLoginResponse = {
  access_token: "mock-access-token",
  token_type: "bearer",
  user: mockUsers[0],
}
