---
name: react-page
description: Create a page component and add it to the routing configuration with lazy loading. Use when adding a new page or route to the app (e.g., "create settings page", "add about page", "make a dashboard page"). Handles both feature-specific and shared pages.
---

# React Page Creation

Create a page component and configure routing following the boilerplate's patterns.

## Page Types

**Feature Page** - Lives in feature directory
- Location: `frontend/src/features/{feature}/pages/{page-name}-page.tsx`
- Example: ProductsPage, OrderDetailPage
- Connected to feature's API/hooks

**Shared Page** - Lives in shared pages directory
- Location: `frontend/src/pages/{page-name}-page.tsx`
- Example: DashboardPage, SettingsPage, NotFoundPage
- Uses multiple features or standalone

## Step 1: Gather Requirements

Ask the user for:
1. **Page name** (e.g., "Products", "Settings", "Dashboard")
2. **Page type** (feature-specific or shared)
3. **Route path** (e.g., "/products", "/settings", "/dashboard")
4. **Protected** (requires authentication?)
5. **Permissions** (specific permissions needed?)

## Step 2: Create Page Component

### Feature Page Example

**Location**: `frontend/src/features/{feature}/pages/{resources}-page.tsx`

```typescript
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from '../hooks'
import { ProductCard } from '../components/product-card'

export function ProductsPage() {
 const { t } = useTranslation()
 const { data: products, isLoading, error } = useProducts()

 if (isLoading) {
 return (
 <div className="flex items-center justify-center h-64">
 <p className="text-muted-foreground">{t('common.loading')}</p>
 </div>
 )
 }

 if (error) {
 return (
 <div className="flex items-center justify-center h-64">
 <p className="text-destructive">{t('common.error')}</p>
 </div>
 )
 }

 return (
 <div className="container py-6 space-y-6">
 {/* Header */}
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">
 {t('products.title')}
 </h1>
 <p className="text-muted-foreground">
 {t('products.description')}
 </p>
 </div>
 <Button>
 <Plus className="h-4 w-4 mr-2" />
 {t('products.actions.create')}
 </Button>
 </div>

 {/* Content */}
 {products && products.items.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground">
 {t('products.empty')}
 </div>
 ) : (
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {products?.items.map((product) => (
 <ProductCard key={product.id} product={product} />
 ))}
 </div>
 )}
 </div>
 )
}
```

### Shared Page Example

**Location**: `frontend/src/pages/dashboard-page.tsx`

```typescript
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/store'

export function DashboardPage() {
 const { t } = useTranslation()
 const { user } = useAuth()

 return (
 <div className="container py-6 space-y-6">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">
 {t('dashboard.title')}
 </h1>
 <p className="text-muted-foreground">
 {t('dashboard.welcome', { name: user?.first_name })}
 </p>
 </div>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <Card>
 <CardHeader>
 <CardTitle>{t('dashboard.stats.users')}</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold">1,234</p>
 </CardContent>
 </Card>
 {/* More cards */}
 </div>
 </div>
 )
}
```

## Step 3: Add Route Configuration

**Location**: `frontend/src/routes/index.tsx`

### Public Route

```typescript
import { DashboardPage } from '@/pages/dashboard-page'

// In routes array
{
 path: '/dashboard',
 element: <DashboardPage />,
}
```

### Protected Route

```typescript
import { ProductsPage } from '@/features/products/pages/products-page'
import { ProtectedRoute } from './protected-route'

// In routes array
{
 path: '/products',
 element: (
 <ProtectedRoute>
 <ProductsPage />
 </ProtectedRoute>
 ),
}
```

### Protected Route with Permissions

```typescript
import { UsersPage } from '@/features/users/pages/users-page'
import { ProtectedRoute } from './protected-route'

// In routes array
{
 path: '/users',
 element: (
 <ProtectedRoute requiredPermissions={['users:read']}>
 <UsersPage />
 </ProtectedRoute>
 ),
}
```

### Nested Routes

```typescript
import { ProductsPage } from '@/features/products/pages/products-page'
import { ProductDetailPage } from '@/features/products/pages/product-detail-page'

// In routes array
{
 path: '/products',
 children: [
 {
 index: true,
 element: <ProtectedRoute><ProductsPage /></ProtectedRoute>,
 },
 {
 path: ':id',
 element: <ProtectedRoute><ProductDetailPage /></ProtectedRoute>,
 },
 ],
}
```

## Page Layout Patterns

### Page with Header and Actions

```typescript
<div className="container py-6 space-y-6">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-bold">{t('page.title')}</h1>
 <p className="text-muted-foreground">{t('page.description')}</p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline">{t('common.filter')}</Button>
 <Button>{t('common.create')}</Button>
 </div>
 </div>

 {/* Content */}
</div>
```

### Page with Tabs

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<div className="container py-6 space-y-6">
 <h1 className="text-3xl font-bold">{t('settings.title')}</h1>

 <Tabs defaultValue="profile">
 <TabsList>
 <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
 <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
 <TabsTrigger value="billing">{t('settings.tabs.billing')}</TabsTrigger>
 </TabsList>

 <TabsContent value="profile">
 {/* Profile settings */}
 </TabsContent>

 <TabsContent value="security">
 {/* Security settings */}
 </TabsContent>

 <TabsContent value="billing">
 {/* Billing settings */}
 </TabsContent>
 </Tabs>
</div>
```

### Page with Sidebar

```typescript
<div className="container py-6">
 <div className="flex gap-6">
 {/* Sidebar */}
 <aside className="w-64 space-y-4">
 <nav className="space-y-1">
 <Button variant="ghost" className="w-full justify-start">
 {t('settings.nav.profile')}
 </Button>
 <Button variant="ghost" className="w-full justify-start">
 {t('settings.nav.security')}
 </Button>
 </nav>
 </aside>

 {/* Main content */}
 <main className="flex-1 space-y-6">
 <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
 {/* Content */}
 </main>
 </div>
</div>
```

## Loading States

```typescript
export function ProductsPage() {
 const { data: products, isLoading } = useProducts()

 if (isLoading) {
 return (
 <div className="container py-6">
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i}>
 <CardContent className="p-6">
 <Skeleton className="h-4 w-full mb-2" />
 <Skeleton className="h-4 w-2/3" />
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )
 }

 return (/* Normal page content */)
}
```

## Error States

```typescript
export function ProductsPage() {
 const { data: products, error } = useProducts()

 if (error) {
 return (
 <div className="container py-6">
 <div className="flex flex-col items-center justify-center h-64 space-y-4">
 <p className="text-lg text-destructive">
 {t('products.error.loadFailed')}
 </p>
 <Button onClick={() => window.location.reload()}>
 {t('common.retry')}
 </Button>
 </div>
 </div>
 )
 }

 return (/* Normal page content */)
}
```

## Empty States

```typescript
{products && products.items.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-64 space-y-4">
 <div className="rounded-full bg-muted p-6">
 <PackageX className="h-12 w-12 text-muted-foreground" />
 </div>
 <div className="text-center space-y-2">
 <p className="text-lg font-medium">{t('products.empty.title')}</p>
 <p className="text-sm text-muted-foreground">
 {t('products.empty.description')}
 </p>
 </div>
 <Button onClick={() => setCreateDialogOpen(true)}>
 <Plus className="h-4 w-4 mr-2" />
 {t('products.actions.createFirst')}
 </Button>
 </div>
) : (
 // List of products
)}
```

## Breadcrumbs

For detail pages:

```typescript
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

<div className="container py-6 space-y-6">
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Link to="/products" className="hover:text-foreground">
 {t('products.title')}
 </Link>
 <ChevronRight className="h-4 w-4" />
 <span className="text-foreground">{product.name}</span>
 </div>

 {/* Page content */}
</div>
```

## Add Navigation Link

Update `frontend/src/components/layout/sidebar.tsx` (or wherever navigation is):

```typescript
import { Package } from 'lucide-react'

// Add to navigation items
{
 to: '/products',
 label: t('nav.products'),
 icon: <Package className="h-4 w-4" />,
 requiredPermission: 'products:read',
}
```

## i18n Translations

Add to `frontend/src/i18n/locales/en/translation.json`:

```json
{
 "products": {
 "title": "Products",
 "description": "Manage your product catalog",
 "empty": {
 "title": "No products yet",
 "description": "Get started by creating your first product",
 },
 "error": {
 "loadFailed": "Failed to load products"
 },
 "actions": {
 "create": "Create Product",
 "createFirst": "Create your first product"
 }
 },
 "nav": {
 "products": "Products"
 }
}
```

## Page Title and Meta

For better SEO and browser tab titles:

```typescript
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function ProductsPage() {
 const { t } = useTranslation()

 useEffect(() => {
 document.title = `${t('products.title')} - ${t('app.name')}`
 }, [t])

 return (/* Page content */)
}
```

## Reference Files

**Page examples:**
- `frontend/src/features/items/pages/items-page.tsx` - CRUD list page
- `frontend/src/features/profile/pages/profile-page.tsx` - Single-entity page
- `frontend/src/features/auth/pages/login-page.tsx` - Public page
- `frontend/src/pages/dashboard-page.tsx` - Shared page

**Routing:**
- `frontend/src/routes/index.tsx` - Route configuration
- `frontend/src/routes/protected-route.tsx` - Protected route wrapper
