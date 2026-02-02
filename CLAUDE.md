# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Type check with tsc and build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint with TypeScript rules

### Testing
- `npm run test` - Run Vitest tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Type Generation
- `npm run generate:types` - Generate TypeScript types from backend OpenAPI schema at `${VITE_API_BASE_URL}/openapi.json` (requires backend running)

## Architecture Overview

### Tech Stack Core
- **Build:** Vite + React 18 + TypeScript (strict mode enabled)
- **Styling:** TailwindCSS V4 + shadcn/ui components
- **State:** Zustand (slices pattern) for client state, TanStack Query for server state
- **Routing:** React Router v6 with ProtectedRoute wrapper
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios with automatic token refresh interceptors
- **i18n:** i18next (EN/ES)

### State Management Pattern

The app uses a **split state strategy**:

1. **Zustand (client state)** - Located in `src/store/`
   - Uses the slices pattern: `createAuthSlice`, `createUISlice` combined in `src/store/index.ts`
   - Auth slice: user object, permissions array, isAuthenticated flag
   - UI slice: sidebar collapsed state, theme preferences
   - Selectors exported as custom hooks: `useAuth()`, `useUI()`
   - Persists only UI preferences to localStorage via Zustand persist middleware

2. **TanStack Query (server state)** - Query hooks in feature directories (e.g., `src/features/auth/hooks/`)
   - All API data caching and synchronization
   - Query client configured in `src/lib/query-client.ts`

### Authentication System

Multi-layered authentication with token refresh:

1. **Token storage:** Dual strategy - httpOnly cookies (preferred) with localStorage fallback
2. **Axios interceptors** (`src/api/interceptors.ts`):
   - Request interceptor: Adds Authorization header from localStorage token
   - Response interceptor: Handles 401 with automatic token refresh via `/v1/auth/refresh`
   - Uses request queueing pattern during refresh to prevent race conditions
   - 403 redirects to `/unauthorized`, 401 after refresh failure redirects to `/login`
3. **Route protection:**
   - `<ProtectedRoute>` wrapper checks `isAuthenticated` from Zustand
   - Optional `requiredPermissions` prop for permission-based access control
   - Redirects to `/login` if unauthenticated, `/unauthorized` if missing permissions
4. **Permission checking:**
   - `usePermissions()` hook provides `hasAllPermissions()` and `hasAnyPermission()`
   - `<Can perform="permission:action">` component for conditional rendering

### Feature-Based Structure

The codebase follows a hybrid structure with feature folders for domain logic:

```
src/features/<feature>/
  ├── api/           # API functions (plain async functions)
  ├── hooks/         # React Query hooks (useQuery, useMutation)
  ├── schemas/       # Zod validation schemas
  ├── components/    # Feature-specific components
  └── pages/         # Feature page components
```

Example: `src/features/auth/` contains login API, hooks, schemas, and pages.

### API Integration

1. **Base client:** `src/api/client.ts` - Axios instance with baseURL from `VITE_API_BASE_URL`
2. **Endpoints:** `src/api/endpoints.ts` - API endpoint constants
3. **Interceptors:** `src/api/interceptors.ts` - Token refresh and error handling
4. **Type generation:** Auto-generated types in `src/types/generated/api.ts` from backend OpenAPI schema

Pattern for new API integrations:
```tsx
// 1. Create API function in features/<name>/api/
export const getUsers = async () => {
  const response = await apiClient.get('/api/v1/users')
  return response.data
}

// 2. Create React Query hook in features/<name>/hooks/
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}
```

### Routing Configuration

Routes defined in `src/routes/index.tsx` using `createBrowserRouter`:
- Public routes: `/login`, `/unauthorized`
- Protected routes wrapped with `<ProtectedRoute>` and `<AppLayout>`
- Permission-based example: `/users` requires `['users:read']` permission
- All protected routes use AppLayout which provides sidebar navigation and header

### Path Aliases

Use `@/` for imports: `@/components`, `@/hooks`, `@/lib`, etc.
Configured in both `vite.config.ts` and `tsconfig.json`.

### Error Handling

Global error handling in `src/api/interceptors.ts`:
- Displays toast notifications via Sonner for non-auth errors
- Auth errors (401) handled silently during token refresh
- 403 errors redirect to unauthorized page

### Environment Variables

Required in `.env` (copy from `.env.example`):
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_APP_TITLE` - Application title
- `VITE_DEFAULT_LANGUAGE` - Default language (en/es)

### Development Server

Vite dev server includes proxy configuration (`vite.config.ts:15-19`):
- `/api` requests proxied to `http://localhost:8000`
- Allows backend and frontend to run on different ports during development
