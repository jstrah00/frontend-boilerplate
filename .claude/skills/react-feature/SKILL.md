---
name: react-feature
description: Create a complete feature following the feature-based architecture with all layers (API, hooks, schemas, components, pages). Use when adding a new CRUD resource or major feature (e.g., "create products feature", "add orders management", "implement notifications feature"). Generates complete directory structure ready for testing.
---

# React Feature Creation

Create a complete feature with API integration, React Query hooks, Zod schemas, components, and pages following the boilerplate's feature-based architecture.

## Feature-Based Architecture

```
features/{feature}/
├── api/ # API functions (axios calls)
├── hooks/ # React Query hooks
├── schemas/ # Zod validation schemas
├── components/ # Feature-specific components
├── pages/ # Feature pages
└── index.ts # Public exports
```

## Step 1: Gather Requirements

Ask the user for:
1. **Feature name** (singular, e.g., "product", "order", "notification")
2. **CRUD operations needed** (list, get, create, update, delete)
3. **Key fields** for the resource
4. **Relationships** (belongs to user, has categories, etc.)

## Step 2: Create Feature Directory Structure

```bash
mkdir -p frontend/src/features/{feature}/{api,hooks,schemas,components,pages}
touch frontend/src/features/{feature}/index.ts
```

## Step 3: Create Types

**Location**: `frontend/src/types/models.ts`

Add types for the new resource:

```typescript
export interface Product {
 id: string
 name: string
 description: string | null
 price: number
 sku: string
 category_id: string
 is_active: boolean
 owner_id: string
 created_at: string
 updated_at: string
}

export interface ProductsListParams {
 skip?: number
 limit?: number
 search?: string
 category?: string
}

export interface ProductsListResponse {
 items: Product[]
 total: number
}
```

## Step 4: Create Zod Schemas

**Use**: `@react-form` skill or create manually

**Location**: `frontend/src/features/{feature}/schemas/{resource}.schema.ts`

```typescript
import { z } from 'zod'

export const productCreateSchema = z.object({
 name: z.string().min(1, 'Name is required').max(100),
 description: z.string().max(500).optional(),
 price: z.coerce.number().positive('Price must be positive'),
 sku: z.string().regex(/^[A-Z0-9-]+$/, 'Invalid SKU format'),
 category_id: z.string().uuid(),
 is_active: z.boolean().default(true),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
```

Export in `schemas/index.ts`:
```typescript
export * from './product.schema'
```

## Step 5: Create API Integration

**Use**: `@api-integration` skill or create manually

**Location**: `frontend/src/features/{feature}/api/{resource}.api.ts`

See `@api-integration` skill for complete API layer creation.

## Step 6: Create React Query Hooks

**Use**: `@api-integration` skill or create manually

**Hooks needed**:
- `use-{resources}.ts` - List query
- `use-{resource}.ts` - Single item query
- `use-create-{resource}.ts` - Create mutation
- `use-update-{resource}.ts` - Update mutation
- `use-delete-{resource}.ts` - Delete mutation

Export all hooks in `hooks/index.ts`.

## Step 7: Create Components

**Use**: `@react-component` and `@react-form` skills

**Typical components needed**:

1. **Display Component** - `{resource}-card.tsx`
 - Shows resource data in a card
 - Example: ProductCard showing name, price, SKU

2. **Form Component** - `{resource}-form.tsx`
 - Create/edit form with Zod validation
 - Used for both create and edit (via defaultValues)

3. **Form Dialog** - `{resource}-form-dialog.tsx`
 - Dialog wrapper for the form
 - Handles open/close state

4. **Delete Dialog** - `delete-{resource}-dialog.tsx`
 - Confirmation dialog for deletion
 - Uses `use-delete-{resource}` hook

5. **Table Component** (optional) - `{resources}-table.tsx`
 - Data table with sorting/filtering
 - Shows list of resources

## Step 8: Create Pages

**Use**: `@react-page` skill or create manually

**Typical page**: `frontend/src/features/{feature}/pages/{resources}-page.tsx`

```typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
 useProducts,
 useCreateProduct,
 useUpdateProduct,
 useDeleteProduct,
} from '../hooks'
import { ProductFormDialog } from '../components/product-form-dialog'
import { ProductCard } from '../components/product-card'
import type { Product } from '@/types/models'

export function ProductsPage() {
 const { t } = useTranslation()
 const [createDialogOpen, setCreateDialogOpen] = useState(false)
 const [editingProduct, setEditingProduct] = useState<Product | null>(null)

 const { data: products, isLoading } = useProducts()
 const createProduct = useCreateProduct()
 const updateProduct = useUpdateProduct()
 const deleteProduct = useDeleteProduct()

 const handleCreate = (data: ProductCreateInput) => {
 createProduct.mutate(data, {
 onSuccess: () => setCreateDialogOpen(false)
 })
 }

 const handleUpdate = (data: ProductUpdateInput) => {
 if (!editingProduct) return
 updateProduct.mutate({ id: editingProduct.id, data }, {
 onSuccess: () => setEditingProduct(null)
 })
 }

 const handleDelete = (id: string) => {
 if (confirm(t('products.confirm.delete'))) {
 deleteProduct.mutate(id)
 }
 }

 if (isLoading) return <div>{t('common.loading')}</div>

 return (
 <div className="container py-6 space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-3xl font-bold">{t('products.title')}</h1>
 <Button onClick={() => setCreateDialogOpen(true)}>
 <Plus className="h-4 w-4 mr-2" />
 {t('products.actions.create')}
 </Button>
 </div>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {products?.items.map((product) => (
 <ProductCard
 key={product.id}
 product={product}
 onEdit={() => setEditingProduct(product)}
 onDelete={() => handleDelete(product.id)}
 />
 ))}
 </div>

 <ProductFormDialog
 open={createDialogOpen}
 onOpenChange={setCreateDialogOpen}
 onSubmit={handleCreate}
 isLoading={createProduct.isPending}
 />

 {editingProduct && (
 <ProductFormDialog
 open={!!editingProduct}
 onOpenChange={(open) => !open && setEditingProduct(null)}
 defaultValues={editingProduct}
 onSubmit={handleUpdate}
 isLoading={updateProduct.isPending}
 />
 )}
 </div>
 )
}
```

## Step 9: Add Routing

**Use**: `@react-page` skill

Update `frontend/src/routes/index.tsx`:

```typescript
import { ProductsPage } from '@/features/products/pages/products-page'

// Inside routes array
{
 path: '/products',
 element: <ProtectedRoute><ProductsPage /></ProtectedRoute>,
}
```

## Step 10: Add i18n Translations

Add translation keys to `frontend/src/i18n/locales/en/translation.json`:

```json
{
 "products": {
 "title": "Products",
 "empty": "No products found",
 "actions": {
 "create": "Create Product",
 "edit": "Edit",
 "delete": "Delete"
 },
 "form": {
 "createTitle": "Create Product",
 "editTitle": "Edit Product",
 "name": "Name",
 "namePlaceholder": "Enter product name",
 "price": "Price",
 "description": "Description"
 },
 "toast": {
 "createSuccess": "Product created successfully",
 "updateSuccess": "Product updated successfully",
 "deleteSuccess": "Product deleted successfully",
 "createError": "Failed to create product",
 "updateError": "Failed to update product",
 "deleteError": "Failed to delete product"
 },
 "confirm": {
 "delete": "Are you sure you want to delete this product?"
 }
 }
}
```

Also add Spanish translations to `es/translation.json`.

## Step 11: Export Feature

Create `frontend/src/features/{feature}/index.ts`:

```typescript
// Export hooks for external use
export * from './hooks'

// Export components (optional, if reused elsewhere)
export { ProductCard } from './components/product-card'

// Export types
export type { Product, ProductCreateInput, ProductUpdateInput } from './schemas'
```

## Complete Feature Checklist

- [ ] Types added to `@/types/models`
- [ ] Zod schemas created in `schemas/`
- [ ] API functions created in `api/`
- [ ] API endpoints added to `@/api/endpoints.ts`
- [ ] React Query hooks created in `hooks/`
- [ ] Components created (Card, Form, Dialogs)
- [ ] Page created in `pages/`
- [ ] Route added to routing configuration
- [ ] i18n translations added (EN + ES)
- [ ] Feature exports configured in `index.ts`
- [ ] Manually test: Create, Read, Update, Delete operations

## Quick Reference: Skill Invocations

For faster feature creation, invoke related skills:

```
Create the complete products feature

I'll need:
- /api-integration for API layer and hooks
- /react-form for ProductForm component
- /react-component for ProductCard component
- /react-page for ProductsPage
```

Then manually:
1. Add types to `@/types/models`
2. Wire up the page in routing
3. Add i18n translations
4. Test the feature

## Reference Features

**Simple CRUD**: `frontend/src/features/items/` - Basic CRUD operations
**Auth Flow**: `frontend/src/features/auth/` - Login/logout workflow
**Profile**: `frontend/src/features/profile/` - Single-entity management
**Users (Admin)**: `frontend/src/features/users/` - Admin CRUD with permissions

## Common Patterns

### Pagination

Add to list params and page component:
```typescript
const [page, setPage] = useState(1)
const { data } = useProducts({ skip: (page - 1) * 20, limit: 20 })
```

### Search/Filtering

Add to list params:
```typescript
const [search, setSearch] = useState('')
const { data } = useProducts({ search })
```

### Permissions

Wrap actions in permission checks:
```typescript
import { Can } from '@/components/auth/can'

<Can perform="products:write">
 <Button onClick={() => handleCreate()}>Create</Button>
</Can>
```

## Reference Files

- `frontend/docs/FEATURE_WORKFLOW.md` - Detailed feature implementation guide
- `frontend/docs/prompts/frontend-patterns.md` - All patterns reference
