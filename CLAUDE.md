# Frontend Boilerplate - React + TypeScript + Vite

Production-ready React SPA integrated with FastAPI backend.

## Quick Context

SPA consuming FastAPI REST API:
- Frontend: Port 5173 (dev), Port 80 (prod)
- Backend API: Port 8000 (VITE_API_BASE_URL)
- Auth: JWT with auto-refresh via localStorage

## Tech Stack

Vite + React 18 + TypeScript | TailwindCSS V4 + shadcn/ui | Zustand + TanStack Query | React Router v6 + React Hook Form + Zod | Axios + i18next

## Commands
```bash
npm run dev # http://localhost:5173
npm run build # Production build
npm run test # Vitest watch
npm run lint # ESLint (max-warnings=0)
npm run generate:types # Generate types from backend OpenAPI
```

## Claude Code Skills (Use with @skill-name)
- `/react-component` - Create TypeScript component with Tailwind and shadcn/ui
- `/react-form` - Create form with Zod validation and react-hook-form
- `/api-integration` - Create API integration with TanStack Query hooks
- `/react-feature` - Complete feature with API, hooks, components, and pages
- `/react-page` - Create page component and add to routing

**IMPORTANT**: Always invoke relevant skill when creating features - they contain boilerplate-specific patterns.

## Project Structure
```
src/
├── api/ # Axios client + interceptors
├── features/<feature>/ # Feature-based architecture
│ ├── api/ # API functions (exports types from models)
│ ├── hooks/ # React Query hooks
│ ├── schemas/ # Zod validation (forms only)
│ ├── components/ # Feature components
│ ├── pages/ # Feature pages
│ └── index.ts # Public exports
├── components/
│ ├── ui/ # shadcn/ui components
│ └── layout/ # AppLayout, Sidebar, Header
├── routes/ # Router config + ProtectedRoute
├── store/ # Zustand (auth + UI state)
├── hooks/ # Custom hooks (usePermissions, useTheme)
├── lib/ # Utilities (cn, formatters)
├── i18n/ # Translations (EN/ES)
├── pages/ # Non-feature pages (Dashboard, NotFound)
└── types/
 ├── models.ts # Shared type definitions (User, Item, etc.)
 └── generated/ # Auto-generated from backend (when available)
```

## Key Patterns

### State Management (CRITICAL)

**Two-state strategy:**
1. **Zustand** (src/store/): Client state only (auth info, UI prefs)
2. **TanStack Query** (feature hooks): ALL server data

**NEVER duplicate server data in Zustand!**

### Type Safety

Types are defined in `src/types/models.ts`:
```typescript
import type { User, Item } from '@/types/models'
```

When backend OpenAPI is available, run `npm run generate:types` to create
`src/types/generated/api.ts` and migrate imports.

### API Integration Pattern
```typescript
// 1. API function (features/<name>/api/<name>.api.ts)
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { User } from '@/types/models'

export const usersApi = {
 getUsers: async () => {
 const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST)
 return response.data
 },
}

// 2. React Query hook (features/<name>/hooks/use-<name>.ts)
export function useUsers() {
 return useQuery({
 queryKey: ['users'],
 queryFn: usersApi.getUsers,
 })
}

// 3. Use in component
const { data: users, isLoading } = useUsers()
```

### Forms

Always use react-hook-form + Zod:
```typescript
const userSchema = z.object({
 email: z.string().email(),
 name: z.string().min(2),
})

const form = useForm({
 resolver: zodResolver(userSchema),
})
```

### Auth Flow

1. Login → tokens stored in localStorage
2. Request interceptor adds `Authorization: Bearer {token}`
3. Response interceptor catches 401 → auto-refresh
4. If refresh fails → logout + redirect to /login

**Token refresh is automatic - don't handle 401 manually!**

### Routing & Permissions
```typescript
// Protected route
<ProtectedRoute requiredPermissions={['users:read']}>
 <UsersPage />
</ProtectedRoute>

// Permission check in component
<Can perform="users:write">
 <Button>Create</Button>
</Can>
```

**Note:** Permissions are currently hardcoded based on `is_admin` flag.
Update `use-login.ts`, `use-current-user.ts`, and `auth-provider.tsx`
when backend sends permissions directly.

### i18n
```typescript
// Components: use useTranslation() hook
const { t } = useTranslation()
// Hooks: use i18n directly (import i18n from '@/i18n/config')
```

### Styling
```typescript
// Tailwind utilities
<div className="flex items-center gap-4 p-4">

// Conditional with cn()
import { cn } from '@/lib/utils'
<button className={cn("px-4 py-2", isActive && "bg-blue-500")}>
```

## Adding New Feature (CRUD)

1. Create structure: `src/features/<name>/{api,hooks,schemas,components,pages,index.ts}`
2. Add types to `src/types/models.ts` if needed
3. API functions → React Query hooks → Components → Pages
4. Add routes to `src/routes/index.tsx`
5. Add i18n keys to `src/i18n/locales/{en,es}/translation.json`

See: `docs/FEATURE_WORKFLOW.md` (in frontend directory)

## Integration with Backend

Backend at http://localhost:8000 | API base /api | Endpoints /v1/* | OpenAPI /openapi.json | Auth: JWT in localStorage

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=My SaaS
VITE_DEFAULT_LANGUAGE=en
```

## Gotchas

- Always use `apiClient` (has interceptors), never raw `axios`
- Always use named import: `import { apiClient } from '@/api/client'`
- Server data ONLY in TanStack Query (not Zustand)
- All pages lazy loaded (already configured)
- Use `i18n.t()` in hooks, `useTranslation()` in components

## Reference Implementations

Auth: `src/features/auth/` | CRUD: `src/features/items/` | Admin: `src/features/users/` | Single-entity: `src/features/profile/`

## Documentation

- Full patterns: `docs/prompts/frontend-patterns.md`
- Workflow guide: `docs/FEATURE_WORKFLOW.md` (frontend-specific)
- Examples: `docs/prompts/EXAMPLE_USAGE.md`
