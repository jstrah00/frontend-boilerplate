# Frontend Feature Examples

Real-world examples of implementing features in this React + TypeScript frontend.

## Table of Contents
- [Example 1: Simple CRUD - Products](#example-1-simple-crud---products)
- [Example 2: Form-Only Feature - Profile](#example-2-form-only-feature---profile)
- [Example 3: Complex Feature - Orders](#example-3-complex-feature---orders)
- [Example 4: Read-Only Dashboard](#example-4-read-only-dashboard)

---

## Example 1: Simple CRUD - Products

Full implementation of a product catalog with list, create, edit, and delete.

### Backend Prerequisites

Backend has these endpoints:
- GET /api/v1/products/ - List products
- GET /api/v1/products/{id} - Get product
- POST /api/v1/products/ - Create product
- PATCH /api/v1/products/{id} - Update product
- DELETE /api/v1/products/{id} - Delete product

Permissions: `products:read`, `products:create`, `products:update`, `products:delete`

### Step 1: Define Types

Add types to `src/types/models.ts`:
```typescript
// src/types/models.ts

export interface Product {
 id: string
 name: string
 description?: string
 price: number
 stock: number
 owner_id: string
 created_at: string
 updated_at: string
}

export interface ProductsListResponse {
 products: Product[]
 total: number
 skip: number
 limit: number
}

export interface ProductsListParams {
 skip?: number
 limit?: number
}
```

**Alternative:** If backend is running, generate types:
```bash
npm run generate:types
```

### Step 2: API Functions
```typescript
// src/features/products/api/products.api.ts
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { Product, ProductsListResponse, ProductsListParams } from '@/types/models'
import { ProductCreateInput, ProductUpdateInput } from '../schemas'

export type { Product, ProductsListResponse, ProductsListParams }

export const productsApi = {
 getProducts: async (params: ProductsListParams = {}): Promise<ProductsListResponse> => {
 const { skip = 0, limit = 10 } = params
 const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
 params: { skip, limit },
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

### Step 3: React Query Hooks

Create separate files for each hook:

```typescript
// src/features/products/hooks/use-products.ts
import { useQuery } from '@tanstack/react-query'
import { productsApi, ProductsListParams } from '../api/products.api'

export const PRODUCTS_QUERY_KEY = 'products'

export function useProducts(params: ProductsListParams = {}) {
 return useQuery({
 queryKey: [PRODUCTS_QUERY_KEY, params],
 queryFn: () => productsApi.getProducts(params),
 })
}
```

```typescript
// src/features/products/hooks/use-create-product.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/i18n/config'
import { ApiError } from '@/types/api-error'
import { productsApi } from '../api/products.api'
import { ProductCreateInput } from '../schemas'
import { PRODUCTS_QUERY_KEY } from './use-products'

export function useCreateProduct() {
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: (data: ProductCreateInput) => productsApi.createProduct(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
 toast.success(i18n.t('products.toast.createSuccess'))
 },
 onError: (error: ApiError) => {
 toast.error(error.response?.data?.detail || i18n.t('products.toast.createError'))
 },
 })
}
```

```typescript
// src/features/products/hooks/use-delete-product.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/i18n/config'
import { ApiError } from '@/types/api-error'
import { productsApi } from '../api/products.api'
import { PRODUCTS_QUERY_KEY } from './use-products'

export function useDeleteProduct() {
 const queryClient = useQueryClient()

 return useMutation({
 mutationFn: (id: string) => productsApi.deleteProduct(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
 toast.success(i18n.t('products.toast.deleteSuccess'))
 },
 onError: (error: ApiError) => {
 toast.error(error.response?.data?.detail || i18n.t('products.toast.deleteError'))
 },
 })
}
```

```typescript
// src/features/products/hooks/index.ts
export { useProducts, PRODUCTS_QUERY_KEY } from './use-products'
export { useProduct } from './use-product'
export { useCreateProduct } from './use-create-product'
export { useUpdateProduct } from './use-update-product'
export { useDeleteProduct } from './use-delete-product'
```

### Step 4: Zod Schema
```typescript
// src/features/products/schemas/product-schema.ts
import { z } from 'zod'

export const productCreateSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 description: z.string().optional(),
 price: z.number().min(0, 'Price must be positive'),
 stock: z.number().int().min(0, 'Stock must be non-negative'),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
```

### Step 5: Components

**ProductCard.tsx:**
```typescript
// src/features/products/components/product-card.tsx
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Can } from '@/components/can'
import type { Product } from '@/types/generated/api'
import { Pencil, Trash2 } from 'lucide-react'

interface ProductCardProps {
 product: Product
 onEdit?: (product: Product) => void
 onDelete?: (id: number) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-start justify-between">
 {product.name}
 <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
 {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
 </Badge>
 </CardTitle>
 </CardHeader>
 
 <CardContent>
 <p className="text-sm text-muted-foreground line-clamp-2">
 {product.description || 'No description'}
 </p>
 
 <div className="mt-4 flex items-center justify-between">
 <span className="text-2xl font-bold">
 ${product.price.toFixed(2)}
 </span>
 <span className="text-sm text-muted-foreground">
 Stock: {product.stock}
 </span>
 </div>
 </CardContent>
 
 <CardFooter className="flex gap-2">
 <Can perform="products:update">
 <Button
 onClick={() => onEdit?.(product)}
 variant="outline"
 size="sm"
 className="flex-1"
 >
 <Pencil className="mr-2 h-4 w-4" />
 Edit
 </Button>
 </Can>
 
 <Can perform="products:delete">
 <Button
 onClick={() => onDelete?.(product.id)}
 variant="destructive"
 size="sm"
 className="flex-1"
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Delete
 </Button>
 </Can>
 </CardFooter>
 </Card>
 )
}
```

**ProductForm.tsx:**
```typescript
// src/features/products/components/product-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
 Form,
 FormControl,
 FormDescription,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
 productCreateSchema,
 type ProductCreateInput,
} from '../schemas/product-schema'

interface ProductFormProps {
 onSubmit: (data: ProductCreateInput) => void
 isPending?: boolean
 defaultValues?: Partial<ProductCreateInput>
}

export function ProductForm({
 onSubmit,
 isPending,
 defaultValues,
}: ProductFormProps) {
 const form = useForm<ProductCreateInput>({
 resolver: zodResolver(productCreateSchema),
 defaultValues: defaultValues || {
 name: '',
 description: '',
 price: 0,
 stock: 0,
 },
 })
 
 return (
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Product Name</FormLabel>
 <FormControl>
 <Input placeholder="Enter product name" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Description</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Enter product description"
 className="resize-none"
 {...field}
 />
 </FormControl>
 <FormDescription>
 Optional. Describe the product in detail.
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <div className="grid gap-6 sm:grid-cols-2">
 <FormField
 control={form.control}
 name="price"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Price ($)</FormLabel>
 <FormControl>
 <Input
 type="number"
 step="0.01"
 min="0"
 placeholder="0.00"
 {...field}
 onChange={(e) => field.onChange(parseFloat(e.target.value))}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 
 <FormField
 control={form.control}
 name="stock"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Stock</FormLabel>
 <FormControl>
 <Input
 type="number"
 min="0"
 placeholder="0"
 {...field}
 onChange={(e) => field.onChange(parseInt(e.target.value))}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 
 <div className="flex justify-end gap-2">
 <Button type="submit" disabled={isPending}>
 {isPending ? 'Saving...' : 'Save Product'}
 </Button>
 </div>
 </form>
 </Form>
 )
}
```

### Step 6: Pages
```typescript
// src/features/products/pages/products-page.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '@/components/ui/dialog'
import { Can } from '@/components/can'
import {
 useProducts,
 useCreateProduct,
 useDeleteProduct,
} from '../hooks/use-products'
import { ProductCard } from '../components/product-card'
import { ProductForm } from '../components/product-form'
import { Plus } from 'lucide-react'
import type { ProductCreateInput } from '../schemas/product-schema'

export function ProductsPage() {
 const { t } = useTranslation()
 const [isCreateOpen, setIsCreateOpen] = useState(false)
 
 const { data: products, isLoading } = useProducts()
 const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
 const { mutate: deleteProduct } = useDeleteProduct()
 
 const handleCreate = (data: ProductCreateInput) => {
 createProduct(data, {
 onSuccess: () => setIsCreateOpen(false),
 })
 }
 
 if (isLoading) {
 return <div>Loading...</div>
 }
 
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">
 {t('products.title')}
 </h1>
 <p className="text-muted-foreground">
 Manage your product catalog
 </p>
 </div>
 
 <Can perform="products:create">
 <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
 <DialogTrigger asChild>
 <Button>
 <Plus className="mr-2 h-4 w-4" />
 {t('products.create')}
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[600px]">
 <DialogHeader>
 <DialogTitle>Create Product</DialogTitle>
 </DialogHeader>
 <ProductForm onSubmit={handleCreate} isPending={isCreating} />
 </DialogContent>
 </Dialog>
 </Can>
 </div>
 
 {products && products.length > 0 ? (
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {products.map((product) => (
 <ProductCard
 key={product.id}
 product={product}
 onDelete={deleteProduct}
 />
 ))}
 </div>
 ) : (
 <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
 <div className="text-center">
 <h3 className="text-lg font-semibold">No products yet</h3>
 <p className="text-sm text-muted-foreground">
 Create your first product to get started
 </p>
 </div>
 </div>
 )}
 </div>
 )
}
```

### Step 7: Routes
```typescript
// src/routes/index.tsx (add this route)
import { lazy } from 'react'

const ProductsPage = lazy(() =>
 import('@/features/products/pages/products-page').then((m) => ({
 default: m.ProductsPage,
 }))
)

// In your routes array:
{
 element: <ProtectedRoute requiredPermissions={['products:read']} />,
 children: [
 {
 element: <AppLayout />,
 children: [
 {
 path: '/products',
 element: <ProductsPage />,
 },
 ],
 },
 ],
}
```

### Step 8: i18n
```json
// src/i18n/locales/en/translation.json
{
 "products": {
 "title": "Products",
 "create": "Create Product",
 "toast": {
 "createSuccess": "Product created successfully",
 "createError": "Failed to create product",
 "updateSuccess": "Product updated successfully",
 "updateError": "Failed to update product",
 "deleteSuccess": "Product deleted successfully",
 "deleteError": "Failed to delete product"
 }
 }
}
```

### Result

Complete CRUD feature with:
- Type-safe API calls
- React Query caching
- Form validation
- Permission checks
- Toast notifications
- Responsive design

**Time to implement:** 1-2 hours

---

## Example 2: Form-Only Feature - Profile

Simpler feature: just a form to update user profile (no list/card needed).

### Backend Endpoints

- GET /api/v1/profile/me - Get current user profile
- PATCH /api/v1/profile/me - Update profile

### Implementation

[Similar structure but simpler - just form + single query + single mutation]

**Key differences:**
- No list/card components
- Single page with form
- useProfile() and useUpdateProfile() hooks only
- No delete functionality

**Time:** 30-45 minutes

---

## Example 3: Complex Feature - Orders

Multi-page feature with list, detail, create, and status tracking.

[Detailed example showing multiple pages, nested routing, status flow]

**Time:** 3-4 hours

---

## Example 4: Read-Only Dashboard

Statistics dashboard with charts (no mutations).

[Example showing multiple queries, chart components, no forms]

**Time:** 1-2 hours

---

## Common Patterns Across Examples

1. **Always generate types first**
2. **API functions → Hooks → Components → Pages**
3. **Permission checks at route and component level**
4. **Toast notifications in hooks (onSuccess/onError)**
5. **Zod schemas for forms, generated types for API**
6. **Lazy loading for all pages**
7. **i18n for all user-facing strings**

---

## Testing Examples

[Add test examples for components, hooks, and integration tests]

