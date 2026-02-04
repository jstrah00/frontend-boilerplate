# Frontend Feature Development Workflow

Step-by-step guide for implementing features in this React + TypeScript frontend.

## Table of Contents
- [Quick Start](#quick-start)
- [Feature Implementation Flow](#feature-implementation-flow)
- [Common Feature Types](#common-feature-types)
- [Integration with Backend](#integration-with-backend)
- [Testing Strategy](#testing-strategy)
- [Tips & Best Practices](#tips--best-practices)

---

## Quick Start

### Prerequisites
- Backend API running at VITE_API_BASE_URL
- Node.js 18+ installed
- Familiarity with React, TypeScript, and TanStack Query

### Typical Feature Timeline
- Simple CRUD: 1-2 hours
- Form with validation: 30-45 minutes
- Complex feature with multiple views: 2-4 hours

---

## Feature Implementation Flow

### Step 1: Backend First (If New Feature)

If this feature requires new backend endpoints:

1. Implement backend first (Model → Repo → Service → API)
2. Test backend endpoints work
3. Verify OpenAPI schema updated at http://localhost:8000/openapi.json

**Then in frontend:**

### Step 2: Define Types

Add types to `src/types/models.ts`:
````typescript
// src/types/models.ts
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
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
````

**Alternative: Generate from backend (when available)**
````bash
# Make sure backend is running!
npm run generate:types
````

This creates/updates `src/types/generated/api.ts` with types from OpenAPI.

### Step 3: Create Feature Structure
````bash
# Create feature directory
mkdir -p src/features/<feature-name>/{api,hooks,schemas,components,pages}

# Example for "products":
mkdir -p src/features/products/{api,hooks,schemas,components,pages}
````

### Step 4: API Layer

Create `src/features/<feature>/api/<feature>.api.ts`:
````typescript
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
````

**Key points:**
- Use `{ apiClient }` (named import, has interceptors)
- Use `API_ENDPOINTS` for endpoint URLs
- Import types from `@/types/models`
- Import form input types from schemas
- Re-export types for consumers
- Return `response.data` (not full response)

### Step 5: React Query Hooks

Create separate files for each hook in `src/features/<feature>/hooks/`:

**use-products.ts (list query):**
````typescript
import { useQuery } from '@tanstack/react-query'
import { productsApi, ProductsListParams } from '../api/products.api'

export const PRODUCTS_QUERY_KEY = 'products'

export function useProducts(params: ProductsListParams = {}) {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, params],
    queryFn: () => productsApi.getProducts(params),
  })
}
````

**use-product.ts (single item query):**
````typescript
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/products.api'
import { PRODUCTS_QUERY_KEY } from './use-products'

export function useProduct(id: string) {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  })
}
````

**use-create-product.ts (mutation):**
````typescript
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
````

**hooks/index.ts (barrel export):**
````typescript
export { useProducts, PRODUCTS_QUERY_KEY } from './use-products'
export { useProduct } from './use-product'
export { useCreateProduct } from './use-create-product'
export { useUpdateProduct } from './use-update-product'
export { useDeleteProduct } from './use-delete-product'
````

**Key points:**
- One hook per file (consistent with codebase pattern)
- Use `i18n.t()` for translations (not `useTranslation()` hook)
- Export query key constants for reuse
- Invalidate queries after mutations
- Type `ApiError` for error handling

### Step 6: Zod Schemas (Forms Only)

Create `src/features/<feature>/schemas/<feature>-schema.ts`:
````typescript
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
````

**Note:** Zod schemas are for form validation only. API types come from generated types.

### Step 7: Components

Create components in `src/features/<feature>/components/`:

**ProductCard.tsx:**
````typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Can } from '@/components/can'
import type { Product } from '@/types/generated/api'
import { formatCurrency } from '@/lib/formatters'

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (id: number) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{product.description}</p>
        <p className="mt-2 text-lg font-semibold">
          {formatCurrency(product.price)}
        </p>
        <p className="text-sm">Stock: {product.stock}</p>
        
        <div className="mt-4 flex gap-2">
          <Can perform="products:update">
            <Button onClick={() => onEdit?.(product)} variant="outline">
              Edit
            </Button>
          </Can>
          
          <Can perform="products:delete">
            <Button 
              onClick={() => onDelete?.(product.id)} 
              variant="destructive"
            >
              Delete
            </Button>
          </Can>
        </div>
      </CardContent>
    </Card>
  )
}
````

**ProductForm.tsx:**
````typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { productCreateSchema, type ProductCreateInput } from '../schemas/product-schema'

interface ProductFormProps {
  onSubmit: (data: ProductCreateInput) => void
  isPending?: boolean
  defaultValues?: Partial<ProductCreateInput>
}

export function ProductForm({ onSubmit, isPending, defaultValues }: ProductFormProps) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
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
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
}
````

### Step 8: Pages

Create pages in `src/features/<feature>/pages/`:

**ProductsPage.tsx (List):**
````typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useProducts, useDeleteProduct } from '../hooks/use-products'
import { ProductCard } from '../components/product-card'
import { Can } from '@/components/can'
import { Plus } from 'lucide-react'

export function ProductsPage() {
  const { t } = useTranslation()
  const { data: products, isLoading } = useProducts()
  const { mutate: deleteProduct } = useDeleteProduct()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('products.title')}</h1>
        
        <Can perform="products:create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('products.create')}
          </Button>
        </Can>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={deleteProduct}
          />
        ))}
      </div>
    </div>
  )
}
````

### Step 9: Routing

Add routes to `src/routes/index.tsx`:
````typescript
import { lazy } from 'react'

const ProductsPage = lazy(() => 
  import('@/features/products/pages/products-page').then(m => ({
    default: m.ProductsPage
  }))
)

// Inside your routes array:
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
````

### Step 10: i18n Translations

Add to `src/i18n/locales/en/translation.json`:
````json
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
````

Add same to `src/i18n/locales/es/translation.json` (Spanish).

### Step 11: Test
````typescript
// src/features/products/components/product-card.test.tsx
import { render, screen } from '@/test/utils'
import { ProductCard } from './product-card'

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 10,
  }
  
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
})
````

---

## Common Feature Types

### 1. Simple CRUD (Products example above)

**Steps:** API → Hooks → Card + Form + List → Page → Routes

**Time:** 1-2 hours

### 2. Form-Only Feature (Profile Update)
````typescript
// Simpler: Just form + mutation
src/features/profile/
├── hooks/
│   └── use-profile.ts       # useProfile(), useUpdateProfile()
├── schemas/
│   └── profile-schema.ts    # Zod validation
├── components/
│   └── profile-form.tsx
└── pages/
    └── profile-page.tsx
````

**Time:** 30-45 minutes

### 3. Read-Only Feature (Dashboard)
````typescript
// No mutations, just queries
src/features/dashboard/
├── api/
│   └── dashboard-api.ts     # Get stats
├── hooks/
│   └── use-dashboard.ts     # useQuery only
├── components/
│   ├── stat-card.tsx
│   └── chart.tsx
└── pages/
    └── dashboard-page.tsx
````

**Time:** 45-60 minutes

### 4. Complex Feature with Multiple Views

Example: Order management with list, detail, create, tracking
````typescript
src/features/orders/
├── api/
│   └── orders-api.ts
├── hooks/
│   └── use-orders.ts
├── schemas/
│   └── order-schema.ts
├── components/
│   ├── order-card.tsx
│   ├── order-form.tsx
│   ├── order-status-badge.tsx
│   └── order-tracking.tsx
└── pages/
    ├── orders-page.tsx        # List
    ├── order-detail-page.tsx  # Single order
    ├── order-create-page.tsx  # Create new
    └── order-track-page.tsx   # Tracking
````

**Time:** 3-4 hours

---

## Integration with Backend

### Typical Full-Stack Feature Flow

1. **Backend First:**
   - Implement Model → Repository → Service → API
   - Test endpoints with Swagger UI
   - Verify permissions work

2. **Generate Types:**
````bash
   npm run generate:types
````

3. **Frontend:**
   - API functions (using generated types)
   - React Query hooks
   - Components
   - Pages
   - Routes

4. **Test Integration:**
   - Login as user with permissions
   - Test CRUD operations
   - Verify error handling (try invalid data)
   - Test permission checks (login as user without perms)

### Debugging Integration Issues

**API not responding:**
````bash
# Check backend is running
curl http://localhost:8000/api/v1/health

# Check CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8000/api/v1/users/
````

**Types don't match:**
````bash
# Re-generate
npm run generate:types

# Check generated file
cat src/types/generated/api.ts | grep "export interface Product"
````

**401 errors:**
- Check token in localStorage: `localStorage.getItem('token')`
- Check interceptor is adding header (Network tab in DevTools)
- Verify token not expired

**403 errors:**
- Check user has required permissions
- Verify backend assigned correct role
- Check requiredPermissions prop on ProtectedRoute

---

## Testing Strategy

### What to Test

1. **Components:**
   - Renders correctly with props
   - Handles user interactions
   - Shows loading/error states

2. **Hooks:**
   - Queries fetch data correctly
   - Mutations call API with correct data
   - Error handling works

3. **Forms:**
   - Validation works (Zod schema)
   - Submission calls mutation
   - Error messages display

### Component Test Example
````typescript
import { render, screen, fireEvent } from '@/test/utils'
import { ProductForm } from './product-form'

describe('ProductForm', () => {
  it('shows validation errors for invalid data', async () => {
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} />)
    
    // Submit empty form
    fireEvent.click(screen.getByText('Submit'))
    
    // Check validation errors appear
    expect(await screen.findByText(/Name must be at least 2 characters/)).toBeInTheDocument()
  })
  
  it('submits valid data', async () => {
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Product' }
    })
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '99.99' }
    })
    
    fireEvent.click(screen.getByText('Submit'))
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Product',
        price: 99.99,
      })
    )
  })
})
````

### Hook Test Example
````typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useProducts } from './use-products'
import { wrapper } from '@/test/utils'

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper })
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0]).toHaveProperty('name')
  })
})
````

---

## Tips & Best Practices

### Performance

1. **Lazy load pages** (already configured)
2. **Use React.memo() for expensive components:**
````typescript
   export const ProductCard = React.memo(function ProductCard({ product }) {
     // ...
   })
````

3. **TanStack Query caching is automatic** - don't over-fetch

### State Management

1. **Server data in TanStack Query ONLY**
2. **Client state in Zustand** (auth info, UI prefs)
3. **Don't duplicate data** between stores

### Type Safety

1. **Always use generated types** from backend
2. **Run generate:types after backend changes**
3. **Don't create manual API types**

### Forms

1. **Always use Zod validation**
2. **Show inline errors** (FormMessage)
3. **Disable submit during pending**

### Error Handling

1. **API errors auto-toast** (in hook's onError)
2. **Component errors use Error Boundary**
3. **Form validation errors inline**

### i18n

1. **All user-facing strings use t()**
2. **Add to both EN and ES files**
3. **Use i18n.t() in hooks** (not useTranslation)

### Permissions

1. **Check on both frontend and backend**
2. **Frontend checks for UX only** (not security)
3. **Use Can component for conditional rendering**

### Styling

1. **Tailwind utilities first**
2. **Use cn() for conditional classes**
3. **shadcn/ui for complex components**

### Code Organization

1. **Feature-based structure**
2. **Keep components small** (< 200 lines)
3. **Extract hooks for complex logic**

---

## Common Issues

### Types don't match backend
→ Run `npm run generate:types`

### 401 infinite loop
→ Clear localStorage and re-login
→ Check refresh_token is valid

### Permission denied (403)
→ Verify backend role has permission
→ Check requiredPermissions matches backend Permission enum

### Form not validating
→ Check Zod schema
→ Verify zodResolver is used

### i18n key not found
→ Add to both en and es translation.json
→ Check key path is correct

### Component not styled
→ Use Tailwind classes directly (not dynamic strings)
→ Use cn() for conditional classes

---

## Next Steps

After implementing a feature:

1. Test manually in browser
2. Run tests: `npm run test`
3. Check types: `npm run build`
4. Check linting: `npm run lint`
5. Commit with descriptive message

For more patterns and examples, see:
- `docs/prompts/frontend-patterns.md` - Detailed patterns
- `docs/prompts/EXAMPLE_USAGE.md` - Complete examples
