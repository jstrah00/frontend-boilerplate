---
name: api-integration
description: Create complete API integration with TanStack Query following the boilerplate's two-layer pattern (API functions + React Query hooks). Use when connecting to a new backend endpoint or adding API calls for a resource (e.g., "add API for products", "integrate orders endpoint", "create hooks for users API").
---

# API Integration Creation

Create complete API integration with TanStack Query hooks following the boilerplate's two-layer pattern.

## Two-Layer Architecture

**Layer 1: API Functions** (`features/{feature}/api/{resource}.api.ts`)
- Pure TypeScript functions
- Direct axios calls using `apiClient`
- Type exports for reuse

**Layer 2: React Query Hooks** (`features/{feature}/hooks/use-{resource}.ts`)
- React hooks wrapping API functions
- TanStack Query (`useQuery`, `useMutation`)
- Cache management and optimistic updates

## Step 1: Gather Requirements

Ask the user for:
1. **Resource name** (e.g., "products", "orders", "comments")
2. **Backend endpoints available** (list, get, create, update, delete)
3. **Query parameters** (pagination, filters, sorting)
4. **Response types** (from backend OpenAPI or manual types)

## Step 2: Create API Functions File

**Location**: `frontend/src/features/{feature}/api/{resource}.api.ts`

```typescript
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { Product, ProductsListResponse, ProductsListParams } from '@/types/models'
import { ProductCreateInput, ProductUpdateInput } from '../schemas'

// Re-export types for convenience
export type { Product, ProductsListResponse, ProductsListParams }

export const productsApi = {
 getProducts: async (params: ProductsListParams = {}): Promise<ProductsListResponse> => {
 const { skip = 0, limit = 10, category, search } = params
 const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
 params: { skip, limit, category, search },
 })
 return response.data
 },

 getProduct: async (id: string): Promise<Product> => {
 const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id))
 return response.data
 },

 createProduct: async (data: ProductCreateInput): Promise<Product> => {
 const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data)
 return response.data
 },

 updateProduct: async (id: string, data: ProductUpdateInput): Promise<Product> => {
 const response = await apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), data)
 return response.data
 },

 deleteProduct: async (id: string): Promise<void> => {
 await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id))
 },
}
```

## Step 3: Add API Endpoints

Update `frontend/src/api/endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
 // ... existing endpoints
 PRODUCTS: {
 LIST: '/v1/products',
 DETAIL: (id: string) => `/v1/products/${id}`,
 CREATE: '/v1/products',
 UPDATE: (id: string) => `/v1/products/${id}`,
 DELETE: (id: string) => `/v1/products/${id}`,
 },
}
```

## Step 4: Create React Query Hooks

### Query Hook (GET list)

**Location**: `frontend/src/features/{feature}/hooks/use-{resources}.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { productsApi, ProductsListParams } from '../api/products.api'

export const PRODUCTS_QUERY_KEY = 'products'

export function useProducts(params: ProductsListParams = {}) {
 return useQuery({
 queryKey: [PRODUCTS_QUERY_KEY, params],
 queryFn: () => productsApi.getProducts(params),
 staleTime: 5 * 60 * 1000, // 5 minutes
 })
}
```

### Query Hook (GET single)

**Location**: `frontend/src/features/{feature}/hooks/use-{resource}.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/products.api'
import { PRODUCTS_QUERY_KEY } from './use-products'

export function useProduct(id: string) {
 return useQuery({
 queryKey: [PRODUCTS_QUERY_KEY, id],
 queryFn: () => productsApi.getProduct(id),
 enabled: !!id, // Only fetch if id exists
 })
}
```

### Mutation Hook (POST create)

**Location**: `frontend/src/features/{feature}/hooks/use-create-{resource}.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { productsApi } from '../api/products.api'
import { PRODUCTS_QUERY_KEY } from './use-products'
import type { ProductCreateInput } from '../schemas'

export function useCreateProduct() {
 const { t } = useTranslation()
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: (data: ProductCreateInput) => productsApi.createProduct(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
 toast.success(t('products.toast.createSuccess'))
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.detail || t('products.toast.createError'))
 },
 })
}
```

### Mutation Hook (PATCH update)

**Location**: `frontend/src/features/{feature}/hooks/use-update-{resource}.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { productsApi } from '../api/products.api'
import { PRODUCTS_QUERY_KEY } from './use-products'
import type { ProductUpdateInput } from '../schemas'

export function useUpdateProduct() {
 const { t } = useTranslation()
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
 productsApi.updateProduct(id, data),
 onSuccess: (_, variables) => {
 // Invalidate both list and detail queries
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, variables.id] })
 toast.success(t('products.toast.updateSuccess'))
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.detail || t('products.toast.updateError'))
 },
 })
}
```

### Mutation Hook (DELETE)

**Location**: `frontend/src/features/{feature}/hooks/use-delete-{resource}.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { productsApi } from '../api/products.api'
import { PRODUCTS_QUERY_KEY } from './use-products'

export function useDeleteProduct() {
 const { t } = useTranslation()
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: (id: string) => productsApi.deleteProduct(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
 toast.success(t('products.toast.deleteSuccess'))
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.detail || t('products.toast.deleteError'))
 },
 })
}
```

## Step 5: Export Hooks

Create `frontend/src/features/{feature}/hooks/index.ts`:

```typescript
export * from './use-products'
export * from './use-product'
export * from './use-create-product'
export * from './use-update-product'
export * from './use-delete-product'
```

## Key Patterns

### Query Keys

Always use consistent query key patterns:
```typescript
// List queries
[RESOURCE_QUERY_KEY, params]

// Detail queries
[RESOURCE_QUERY_KEY, id]

// Nested resources
[PARENT_QUERY_KEY, parentId, CHILD_QUERY_KEY]
```

### Cache Invalidation

```typescript
// Invalidate all product queries
queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })

// Invalidate specific product
queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, id] })

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] })
```

### Optimistic Updates

For instant UI feedback:

```typescript
export function useUpdateProduct() {
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: ({ id, data }) => productsApi.updateProduct(id, data),
 onMutate: async ({ id, data }) => {
 // Cancel outgoing refetches
 await queryClient.cancelQueries({ queryKey: [PRODUCTS_QUERY_KEY, id] })

 // Snapshot previous value
 const previousProduct = queryClient.getQueryData([PRODUCTS_QUERY_KEY, id])

 // Optimistically update
 queryClient.setQueryData([PRODUCTS_QUERY_KEY, id], (old: Product) => ({
 ...old,
 ...data,
 }))

 return { previousProduct }
 },
 onError: (err, variables, context) => {
 // Rollback on error
 queryClient.setQueryData(
 [PRODUCTS_QUERY_KEY, variables.id],
 context?.previousProduct
 )
 },
 onSettled: (_, __, variables) => {
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, variables.id] })
 },
 })
}
```

### Pagination

```typescript
export function useProducts(params: ProductsListParams = {}) {
 return useQuery({
 queryKey: [PRODUCTS_QUERY_KEY, params],
 queryFn: () => productsApi.getProducts(params),
 keepPreviousData: true, // Show old data while fetching new page
 })
}
```

### Infinite Scroll

```typescript
export function useInfiniteProducts() {
 return useInfiniteQuery({
 queryKey: [PRODUCTS_QUERY_KEY],
 queryFn: ({ pageParam = 0 }) =>
 productsApi.getProducts({ skip: pageParam, limit: 20 }),
 getNextPageParam: (lastPage, pages) => {
 const nextSkip = pages.length * 20
 return lastPage.items.length === 20 ? nextSkip : undefined
 },
 })
}
```

## Usage in Components

```typescript
import { useProducts, useCreateProduct } from '../hooks'

export function ProductsPage() {
 const { data: products, isLoading, error } = useProducts({ limit: 20 })
 const createProduct = useCreateProduct()

 const handleCreate = (data: ProductCreateInput) => {
 createProduct.mutate(data)
 }

 if (isLoading) return <Loading />
 if (error) return <Error message={error.message} />

 return (
 <div>
 {products?.items.map((product) => (
 <ProductCard key={product.id} product={product} />
 ))}
 <ProductForm
 onSubmit={handleCreate}
 isLoading={createProduct.isPending}
 />
 </div>
 )
}
```

## Type Safety

**Import types from:**
- `@/types/models` - Shared type definitions
- `@/types/generated/api` - Auto-generated from backend OpenAPI (preferred)

**Always re-export types from API files:**
```typescript
export type { Product, ProductsListResponse } from '@/types/models'
```

## Error Handling

Backend errors are automatically caught by axios interceptor, but mutations should show user-friendly messages:

```typescript
onError: (error: any) => {
 const message = error.response?.data?.detail || t('common.error')
 toast.error(message)
}
```

## Reference Files

**API examples:**
- `frontend/src/features/items/api/items.api.ts` - Complete CRUD API
- `frontend/src/features/auth/api/auth.api.ts` - Auth API

**Hook examples:**
- `frontend/src/features/items/hooks/` - All CRUD hooks
- `frontend/src/features/auth/hooks/` - Auth hooks

**Patterns documentation:**
- `frontend/docs/prompts/frontend-patterns.md` - API integration patterns
