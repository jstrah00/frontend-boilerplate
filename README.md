# Frontend Boilerplate

A production-ready React + TypeScript + Vite frontend boilerplate integrated with FastAPI backend.

## Tech Stack

- **Core:** Vite + React 18 + TypeScript (strict mode)
- **Styling:** TailwindCSS V4 + shadcn/ui components
- **State Management:** Zustand (slices pattern) + TanStack Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios with interceptors
- **Internationalization:** i18next (EN/ES)
- **Notifications:** Sonner
- **Testing:** Vitest + React Testing Library
- **Deployment:** Docker (multi-stage build with nginx)

## Features

- Complete authentication system with token refresh
- Protected routes with permission-based access control
- Dark/light/system theme support
- Multi-language support (English/Spanish)
- Type-safe API integration with OpenAPI type generation
- Responsive layout with collapsible sidebar
- Form validation with Zod schemas
- Global error handling and toast notifications
- Production-ready Docker configuration

## Claude Code Integration

This boilerplate is optimized for [Claude Code](https://claude.ai/claude-code). The `CLAUDE.md` file provides Claude with project context, patterns, and conventions to assist effectively with development tasks.

**Available Skills** (`.claude/skills/`):
- `react-component` - Create feature-specific React components
- `react-form` - Create forms with react-hook-form + Zod validation
- `api-integration` - Create API functions + React Query hooks
- `react-feature` - Create complete CRUD feature structure
- `react-page` - Create page components with routing configuration

For detailed patterns and workflows, see `docs/prompts/frontend-patterns.md` and `docs/FEATURE_WORKFLOW.md`.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000` (optional for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-boilerplate
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run generate:types` - Generate TypeScript types from OpenAPI schema

## Project Structure

```
src/
├── api/                    # API client and configuration
│   ├── client.ts          # Axios instance with baseURL
│   ├── endpoints.ts       # API endpoint constants
│   └── interceptors.ts    # Request/response interceptors (auth, refresh)
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (AppLayout, Sidebar, Header)
│   └── data-table/       # Reusable data table component
├── features/             # Feature-based modules
│   ├── auth/            # Authentication (login, logout, current user)
│   ├── items/           # Items CRUD example
│   ├── users/           # Users admin management
│   └── profile/         # User profile management
├── hooks/               # Custom React hooks (usePermissions, useTheme)
├── i18n/                # Internationalization
│   ├── config.ts        # i18next configuration
│   └── locales/         # Translation files (en, es)
├── lib/                 # Utility libraries
├── pages/               # Non-feature pages (Dashboard, NotFound, Unauthorized)
├── routes/              # Routing configuration + ProtectedRoute
├── store/               # Zustand state management
│   └── slices/          # State slices (auth, ui)
├── types/               # TypeScript types
│   ├── models.ts        # Shared type definitions
│   └── generated/       # Auto-generated API types (when available)
└── test/                # Test utilities
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Application Configuration
VITE_APP_TITLE=Frontend Boilerplate
VITE_DEFAULT_LANGUAGE=en
```

## Authentication

The boilerplate includes a complete authentication system:

1. Login with email and password
2. JWT tokens stored in localStorage (access_token, refresh_token)
3. Automatic token refresh on 401 responses
4. Protected routes requiring authentication
5. Permission-based access control (currently based on is_admin flag)

### Usage Example

```tsx
// Protect a route
<ProtectedRoute requiredPermissions={['users:read']}>
  <UsersPage />
</ProtectedRoute>

// Permission-based rendering
<Can perform="users:write">
  <Button>Create User</Button>
</Can>
```

## State Management

The boilerplate uses Zustand for client state and TanStack Query for server state:

- **Zustand:** UI state, auth state (user, permissions)
- **TanStack Query:** API data caching and synchronization

## API Integration

### Type Definitions

Types are defined in `src/types/models.ts`. When your backend is running,
you can generate types from OpenAPI:

```bash
npm run generate:types
```

### Making API Calls

```tsx
// 1. Define API function (src/features/<name>/api/<name>.api.ts)
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { User } from '@/types/models'

export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST)
    return response.data
  },
}

// 2. Create React Query hook (src/features/<name>/hooks/use-<name>.ts)
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  })
}

// 3. Use in component
function UsersPage() {
  const { data, isLoading } = useUsers()
  // ...
}
```

## Internationalization

Switch between English and Spanish:

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('common.welcome')}</h1>
}
```

## Theme Support

Toggle between light, dark, and system themes:

```tsx
import { useTheme } from '@/hooks/use-theme'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme('dark')}>Dark Mode</button>
}
```

## Docker Deployment

Build and run with Docker:

```bash
docker build -t frontend-boilerplate .
docker run -p 3000:80 frontend-boilerplate
```

Access at `http://localhost:3000`

## Testing

Run tests:

```bash
npm run test
```

Run with coverage:

```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT
