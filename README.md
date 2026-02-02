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
│   ├── client.ts          # Axios instance
│   ├── endpoints.ts       # API endpoint constants
│   └── interceptors.ts    # Request/response interceptors
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── features/             # Feature-based modules
│   └── auth/            # Authentication feature
│       ├── api/         # Auth API functions
│       ├── hooks/       # Auth React Query hooks
│       ├── schemas/     # Zod validation schemas
│       ├── components/  # Auth components
│       └── pages/       # Auth pages
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
│   ├── config.ts        # i18next configuration
│   └── locales/         # Translation files
├── lib/                 # Utility libraries
├── pages/               # Page components
├── routes/              # Routing configuration
├── store/               # Zustand state management
│   └── slices/          # State slices
├── types/               # TypeScript types
│   └── generated/       # Auto-generated API types
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
2. Token stored in httpOnly cookies (with localStorage fallback)
3. Automatic token refresh before expiration
4. Protected routes requiring authentication
5. Permission-based access control

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

### Type Generation

Generate TypeScript types from your backend OpenAPI schema:

```bash
npm run generate:types
```

### Making API Calls

```tsx
// Define API function
export const getUsers = async () => {
  const response = await apiClient.get('/api/v1/users')
  return response.data
}

// Use with React Query
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}

// Use in component
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
