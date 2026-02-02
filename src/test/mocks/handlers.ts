import { http, HttpResponse } from "msw"
import { mockUsers, mockItems, mockLoginResponse } from "./data"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/v1/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === "admin@example.com" && body.password === "admin123") {
      return HttpResponse.json(mockLoginResponse)
    }

    return HttpResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/v1/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully" })
  }),

  http.post(`${API_BASE_URL}/v1/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: "mock-refreshed-token",
      token_type: "bearer",
    })
  }),

  http.get(`${API_BASE_URL}/v1/users/me`, () => {
    return HttpResponse.json(mockUsers[0])
  }),

  // Users endpoints
  http.get(`${API_BASE_URL}/v1/users`, ({ request }) => {
    const url = new URL(request.url)
    const skip = parseInt(url.searchParams.get("skip") || "0")
    const limit = parseInt(url.searchParams.get("limit") || "10")

    const paginatedUsers = mockUsers.slice(skip, skip + limit)

    return HttpResponse.json({
      items: paginatedUsers,
      total: mockUsers.length,
      skip,
      limit,
    })
  }),

  http.get(`${API_BASE_URL}/v1/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id)

    if (!user) {
      return HttpResponse.json(
        { detail: "User not found" },
        { status: 404 }
      )
    }

    return HttpResponse.json(user)
  }),

  http.post(`${API_BASE_URL}/v1/users`, async ({ request }) => {
    const body = await request.json() as any

    const newUser = {
      id: String(mockUsers.length + 1),
      ...body,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: body.role === "admin" ? ["users:read", "users:write", "items:read", "items:write"] : ["items:read", "items:write"],
    }

    mockUsers.push(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/v1/users/:id`, async ({ params, request }) => {
    const body = await request.json() as any
    const userIndex = mockUsers.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return HttpResponse.json(
        { detail: "User not found" },
        { status: 404 }
      )
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockUsers[userIndex])
  }),

  http.delete(`${API_BASE_URL}/v1/users/:id`, ({ params }) => {
    const userIndex = mockUsers.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return HttpResponse.json(
        { detail: "User not found" },
        { status: 404 }
      )
    }

    mockUsers.splice(userIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_BASE_URL}/v1/users/:id/password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Items endpoints
  http.get(`${API_BASE_URL}/v1/items`, ({ request }) => {
    const url = new URL(request.url)
    const skip = parseInt(url.searchParams.get("skip") || "0")
    const limit = parseInt(url.searchParams.get("limit") || "10")

    const paginatedItems = mockItems.slice(skip, skip + limit)

    return HttpResponse.json({
      items: paginatedItems,
      total: mockItems.length,
      skip,
      limit,
    })
  }),

  http.get(`${API_BASE_URL}/v1/items/:id`, ({ params }) => {
    const item = mockItems.find((i) => i.id === params.id)

    if (!item) {
      return HttpResponse.json(
        { detail: "Item not found" },
        { status: 404 }
      )
    }

    return HttpResponse.json(item)
  }),

  http.post(`${API_BASE_URL}/v1/items`, async ({ request }) => {
    const body = await request.json() as any

    const newItem = {
      id: String(mockItems.length + 1),
      ...body,
      owner_id: "1",
      owner_email: "admin@example.com",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockItems.push(newItem)
    return HttpResponse.json(newItem, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/v1/items/:id`, async ({ params, request }) => {
    const body = await request.json() as any
    const itemIndex = mockItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json(
        { detail: "Item not found" },
        { status: 404 }
      )
    }

    mockItems[itemIndex] = {
      ...mockItems[itemIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockItems[itemIndex])
  }),

  http.delete(`${API_BASE_URL}/v1/items/:id`, ({ params }) => {
    const itemIndex = mockItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json(
        { detail: "Item not found" },
        { status: 404 }
      )
    }

    mockItems.splice(itemIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Profile endpoints
  http.patch(`${API_BASE_URL}/v1/profile`, async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      ...mockUsers[0],
      ...body,
      updated_at: new Date().toISOString(),
    })
  }),

  http.post(`${API_BASE_URL}/v1/profile/password`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
