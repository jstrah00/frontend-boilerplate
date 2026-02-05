---
name: react-form
description: Create form components with Zod schema validation and react-hook-form following the boilerplate's patterns. Use when asked to create a form for creating or editing resources (e.g., "create a product form", "add user creation form", "make an edit profile form"). Generates Zod schema and form component with proper validation.
---

# React Form Creation

Create a form component with react-hook-form and Zod validation following the boilerplate's patterns.

## Step 1: Gather Requirements

Ask the user for:
1. **Form purpose** (create new resource, edit existing, login, etc.)
2. **Feature name** (e.g., "products", "users", "profile")
3. **Form fields** with types and validation rules
4. **Submit behavior** (API mutation, local state update, etc.)

## Step 2: Create Zod Schema

**Location**: `frontend/src/features/{feature}/schemas/{resource}.schema.ts`

Create validation schema:

```typescript
import { z } from 'zod'

export const productCreateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description is too long')
    .optional(),

  price: z.coerce.number()
    .positive('Price must be positive')
    .max(1000000, 'Price is too high'),

  sku: z.string()
    .regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase letters, numbers, and hyphens'),

  category_id: z.string().uuid('Invalid category'),

  is_active: z.boolean().default(true),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
```

**Common Zod patterns:**
```typescript
// Required string
z.string().min(1, 'Field is required')

// Optional string
z.string().optional()

// Email
z.string().email('Invalid email address')

// Number (coerce from string input)
z.coerce.number().positive().max(1000)

// Boolean with default
z.boolean().default(false)

// Enum
z.enum(['active', 'inactive', 'pending'])

// UUID
z.string().uuid('Invalid ID')

// Date
z.string().datetime()

// Regex pattern
z.string().regex(/^[A-Z]+$/, 'Must be uppercase')

// Refine (custom validation)
z.object({
  password: z.string(),
  confirm: z.string()
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ['confirm'] // Which field to show error on
})
```

## Step 3: Export Schema

Create or update `frontend/src/features/{feature}/schemas/index.ts`:

```typescript
export * from './{resource}.schema'
```

## Step 4: Create Form Component

**Location**: `frontend/src/features/{feature}/components/{resource}-form.tsx`

**File naming**: kebab-case (e.g., `product-form.tsx`, `user-create-form.tsx`)

## Step 5: Form Component Structure

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { productCreateSchema, ProductCreateInput } from '../schemas'

interface ProductFormProps {
  onSubmit: (data: ProductCreateInput) => void
  isLoading?: boolean
  defaultValues?: Partial<ProductCreateInput>
}

export function ProductForm({ onSubmit, isLoading, defaultValues }: ProductFormProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('products.form.name')}</Label>
        <Input
          id="name"
          placeholder={t('products.form.namePlaceholder')}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">{t('products.form.price')}</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('price')}
        />
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('common.saving') : t('common.save')}
      </Button>
    </form>
  )
}
```

## Step 6: Form Field Types

### Text Input

```typescript
<div className="space-y-2">
  <Label htmlFor="name">{t('field.label')}</Label>
  <Input
    id="name"
    placeholder={t('field.placeholder')}
    {...register('name')}
  />
  {errors.name && (
    <p className="text-sm text-destructive">{errors.name.message}</p>
  )}
</div>
```

### Textarea

```typescript
<div className="space-y-2">
  <Label htmlFor="description">{t('field.label')}</Label>
  <Textarea
    id="description"
    rows={4}
    placeholder={t('field.placeholder')}
    {...register('description')}
  />
  {errors.description && (
    <p className="text-sm text-destructive">{errors.description.message}</p>
  )}
</div>
```

### Number Input

```typescript
<div className="space-y-2">
  <Label htmlFor="price">{t('field.label')}</Label>
  <Input
    id="price"
    type="number"
    step="0.01"
    min="0"
    placeholder="0.00"
    {...register('price')}
  />
  {errors.price && (
    <p className="text-sm text-destructive">{errors.price.message}</p>
  )}
</div>
```

### Select Dropdown

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Controller } from 'react-hook-form'

<div className="space-y-2">
  <Label htmlFor="category">{t('field.label')}</Label>
  <Controller
    name="category_id"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder={t('field.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
  {errors.category_id && (
    <p className="text-sm text-destructive">{errors.category_id.message}</p>
  )}
</div>
```

### Checkbox

```typescript
import { Checkbox } from '@/components/ui/checkbox'
import { Controller } from 'react-hook-form'

<div className="flex items-center space-x-2">
  <Controller
    name="is_active"
    control={control}
    render={({ field }) => (
      <Checkbox
        id="is_active"
        checked={field.value}
        onCheckedChange={field.onChange}
      />
    )}
  />
  <Label htmlFor="is_active">{t('field.label')}</Label>
</div>
```

## Step 7: Form Layouts

### Simple Stack

```typescript
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  {/* Fields stacked vertically */}
</form>
```

### Two Column Grid

```typescript
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      {/* First name */}
    </div>
    <div className="space-y-2">
      {/* Last name */}
    </div>
  </div>
  {/* More fields */}
</form>
```

### Card Wrapper

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>{t('form.title')}</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Fields */}
    </form>
  </CardContent>
</Card>
```

## Step 8: Form in Dialog

For forms in dialogs (common pattern):

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProductCreateInput) => void
}

export function ProductFormDialog({ open, onOpenChange, onSubmit }: ProductFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
  })

  const handleFormSubmit = (data: ProductCreateInput) => {
    onSubmit(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('products.form.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Fields using form.register */}

          <Button type="submit">
            {t('common.create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Step 9: Connect to API Mutation

In the page/parent component:

```typescript
import { useCreateProduct } from '../hooks/use-products'
import { ProductForm } from '../components/product-form'

export function ProductsPage() {
  const createProduct = useCreateProduct()

  return (
    <ProductForm
      onSubmit={(data) => createProduct.mutate(data)}
      isLoading={createProduct.isPending}
    />
  )
}
```

## Key Patterns

### Edit Form with Default Values

```typescript
<ProductForm
  defaultValues={{
    name: product.name,
    price: product.price,
  }}
  onSubmit={(data) => updateProduct.mutate({ id: product.id, data })}
  isLoading={updateProduct.isPending}
/>
```

### Password Confirmation

```typescript
export const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string()
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ['confirm']
})
```

### Form Reset After Success

```typescript
const form = useForm<ProductCreateInput>({
  resolver: zodResolver(productCreateSchema),
})

const handleSubmit = async (data: ProductCreateInput) => {
  await createProduct.mutateAsync(data)
  form.reset() // Clear form after success
}
```

## Validation Error Messages

Keep error messages user-friendly:
- ✅ "Name is required"
- ✅ "Price must be positive"
- ✅ "Email is invalid"
- ❌ "Field cannot be empty"
- ❌ "Invalid input"
- ❌ "Validation failed"

## Reference Files

**Form examples:**
- `frontend/src/features/profile/components/profile-form.tsx` - Edit form with default values
- `frontend/src/features/auth/components/login-form.tsx` - Simple login form
- `frontend/src/features/items/components/item-form-dialog.tsx` - Form in dialog

**Schema examples:**
- `frontend/src/features/profile/schemas/profile.schema.ts` - Basic schemas
- `frontend/src/features/auth/schemas/login.schema.ts` - Auth schemas

**Patterns documentation:**
- `frontend/docs/prompts/frontend-patterns.md` - Complete form patterns reference
