# Frontend Boilerplate - React + TypeScript + Vite

Production-ready React SPA integrated with FastAPI backend.

## Quick Context

SPA consuming FastAPI REST API:
- Frontend: Port 5173 (dev), Port 80 (prod)
- Backend API: Port 8000 (VITE_API_BASE_URL)
- Auth: JWT in **httpOnly cookies** (since 2026-02-06). Browser sends them automatically via `withCredentials: true`. JS does not touch tokens.

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

## Claude Code Skills

Frontend skills live under `.claude/skills/` and are autodetected by Claude Code. Full index with descriptions: `../docs/SKILLS_REFERENCE.md`. Always invoke the relevant `/skill-name` when creating features — they encode boilerplate-specific patterns.

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

httpOnly cookies, sent by `apiClient` (`src/api/client.ts`) via `withCredentials: true`. The 401/403 redirects live in `src/api/interceptors.ts`.

**Frontend gotchas (the interceptor owns it):**
- Don't handle 401 in components — `src/api/interceptors.ts` redirects to `/login`.
- Don't read tokens from `document.cookie` or `localStorage` — they're httpOnly.
- No client-side auto-refresh. If the access cookie expires, the user re-authenticates.

**Full flow + token structure + refresh mechanics**: `../docs/ARCHITECTURE.md` § Authentication Flow.

### Routing & Permissions

Three primitives, all reading the same Zustand permission list (`src/store/slices/authSlice.ts`):

```typescript
// Route gate (src/routes/protected-route.tsx)
<ProtectedRoute requiredPermissions={['users:read']}>
  <UsersPage />
</ProtectedRoute>

// JSX gate (src/components/can.tsx)
import { Can } from '@/components/can'

<Can perform="users:write">
  <Button>Create</Button>
</Can>

// Programmatic (src/hooks/use-permissions.ts) — for hooks/handlers
import { usePermissions } from '@/hooks/use-permissions'

const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()
if (hasPermission('users:write')) { ... }
```

Permissions arrive from the backend in `user.permissions` and are set by `src/features/auth/hooks/use-login.ts` + `use-current-user.ts`. Avoid hand-rolling `user.permissions.includes(...)` — pick a primitive. **Why the three exist + RBAC backend side**: `../docs/ARCHITECTURE.md` § Permission System.

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

Backend at http://localhost:8000 | API base /api | Endpoints /v1/* | OpenAPI /openapi.json | Auth: JWT in httpOnly cookies (`withCredentials: true`)

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

### Project-level docs (super-repo)

When the frontend is mounted as a submodule of `saas-boilerplate`, additional cross-cutting docs live one level up:

- `../.claude/scratch/{audits,plans}/` — gitignored ephemeral. Meta-audits + tactical plans about the Claude setup. Borrar libre.
- `../docs/plans/active/` — committed. Multi-day feature plans worth tracking while in flight.
- `../docs/adr/` — committed. Permanent architectural decisions (e.g. `001-dual-database-strategy.md`).
- `../docs/gotchas.md` — running log of real incidents.
- `../.claude/rules/frontend-api.md` — path-scoped rules for the API layer (generated types, apiClient, httpOnly cookies, query keys).

_Archive_: `../docs/audits/` and `../docs/plans/` (root) hold pre-2026-04-28 work. Read-only history.
