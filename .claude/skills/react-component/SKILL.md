---
name: react-component
description: Create feature-specific React components with TypeScript, Tailwind CSS, and shadcn/ui. Use when asked to create a new component for a feature (e.g., "create ProductCard component", "add UserAvatar to users feature", "make a new component for items"). Generates properly typed components following the boilerplate's established patterns.
---

# React Component Creation

Create a feature-specific React component following the boilerplate's TypeScript, Tailwind CSS, and shadcn/ui patterns.

## Step 1: Gather Requirements

Ask the user for:
1. **Component name** (PascalCase, e.g., "ProductCard", "UserAvatar")
2. **Feature name** (the feature directory, e.g., "products", "users", "items")
3. **Component purpose** (display data, action button, form input, list, etc.)
4. **Props needed** (what data/callbacks does it receive?)

## Step 2: Determine Component Type

Based on purpose, choose the appropriate pattern:

**Display Component** - Shows data (cards, avatars, badges)
- Uses shadcn/ui Card, Badge components
- Displays formatted data with proper styling
- Example: ProfileCard, UserAvatar, ItemBadge

**Action Component** - Triggers actions (buttons, dialogs)
- Uses shadcn/ui Button, Dialog components
- Handles click events, confirmations
- Example: DeleteButton, EditDialog, ActionMenu

**List Component** - Renders collections
- Maps over array with proper key prop
- Handles empty states
- Example: UserList, ProductGrid, ItemTable

## Step 3: Create Component File

**Location**: `frontend/src/features/{feature}/components/{component-name}.tsx`

**File naming**: kebab-case (e.g., `product-card.tsx`, `user-avatar.tsx`)

## Step 4: Component Structure

Follow this template:

```typescript
// 1. Imports
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { YourType } from '@/types/models' // or '@/types/generated/api'

// 2. Props Interface
interface YourComponentProps {
  data: YourType
  onAction?: (id: string) => void
  className?: string
}

// 3. Component Function
export function YourComponent({ data, onAction, className }: YourComponentProps) {
  // 4. Hooks
  const { t } = useTranslation()

  // 5. Event Handlers
  const handleClick = () => {
    onAction?.(data.id)
  }

  // 6. Render
  return (
    <div className={className}>
      {/* JSX with Tailwind classes */}
    </div>
  )
}
```

## Step 5: Component Patterns

### Display Component Pattern

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import type { User } from '@/types/models'

interface UserCardProps {
  user: User
  className?: string
}

export function UserCard({ user, className }: UserCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <Badge variant={user.is_active ? 'success' : 'secondary'}>
          {t(`users.status.${user.status}`)}
        </Badge>
      </CardContent>
    </Card>
  )
}
```

### Action Component Pattern

```typescript
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeleteButtonProps {
  onDelete: () => void
  disabled?: boolean
}

export function DeleteButton({ onDelete, disabled }: DeleteButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onDelete}
      disabled={disabled}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {t('common.delete')}
    </Button>
  )
}
```

### List Component Pattern

```typescript
import { useTranslation } from 'react-i18next'
import type { User } from '@/types/models'
import { UserCard } from './user-card'

interface UserListProps {
  users: User[]
  onUserClick?: (user: User) => void
}

export function UserList({ users, onUserClick }: UserListProps) {
  const { t } = useTranslation()

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('users.empty')}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => onUserClick?.(user)}
        />
      ))}
    </div>
  )
}
```

## Step 6: Styling Guidelines

**Tailwind CSS conventions:**
- Use semantic spacing: `space-y-4`, `gap-4`, `p-4`
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Color variants: `text-muted-foreground`, `bg-primary`, `border-border`
- Size utilities: `h-4 w-4`, `text-sm`, `rounded-md`

**Common patterns:**
```typescript
// Card with proper spacing
<Card className="p-4 space-y-3">

// Flex layout with items
<div className="flex items-center gap-3">

// Grid for lists
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Responsive text
<p className="text-xs sm:text-sm md:text-base">

// Conditional styling with cn()
import { cn } from '@/lib/utils'
<div className={cn("base-classes", isActive && "active-classes")}>
```

## Step 7: i18n Integration

Always use `useTranslation()` for text:

```typescript
const { t } = useTranslation()

// Translation keys follow feature.section.key pattern
{t('users.card.title')}
{t('users.actions.edit')}
{t('common.loading')} // For shared text
```

**Note**: Translation keys must be added to:
- `frontend/src/i18n/locales/en/translation.json`
- `frontend/src/i18n/locales/es/translation.json`

## Step 8: TypeScript Types

**Import types from:**
- `@/types/models` - Shared type definitions
- `@/types/generated/api` - Auto-generated from backend (when available)

**Always define props interface:**
```typescript
interface ComponentProps {
  required: string
  optional?: number
  callback?: (data: string) => void
  children?: React.ReactNode
  className?: string  // Allow className override
}
```

## Step 9: Export Component

**Always use named exports:**
```typescript
export function ComponentName({ props }: ComponentProps) {
  // ...
}
```

**Never use default exports** - Named exports improve IDE autocomplete and refactoring.

## Common shadcn/ui Components

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Button` (variants: default, destructive, outline, secondary, ghost, link)
- `Badge` (variants: default, secondary, destructive, outline, success)
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Input`, `Label`, `Textarea`, `Select`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Separator`, `Skeleton`, `ScrollArea`

Import from `@/components/ui/{component}`

## Reference Files

**Component examples:**
- `frontend/src/features/profile/components/profile-card.tsx` - Display component
- `frontend/src/features/auth/components/login-form.tsx` - Form component
- `frontend/src/features/items/components/items-table.tsx` - List component

**Patterns documentation:**
- `frontend/docs/prompts/frontend-patterns.md` - Complete pattern reference
