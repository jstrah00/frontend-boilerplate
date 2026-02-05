# Frontend Testing Guide

Complete guide for testing React frontend with Vitest and React Testing Library.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Component Tests](#writing-component-tests)
- [Writing Hook Tests](#writing-hook-tests)
- [Testing API Integration](#testing-api-integration)
- [Testing Routing](#testing-routing)
- [Mocking](#mocking)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Test framework (Vite-native) |
| **React Testing Library** | Component testing utilities |
| **@testing-library/user-event** | User interaction simulation |
| **@testing-library/react-hooks** | Hook testing |
| **MSW (Mock Service Worker)** | API mocking |
| **vitest-ui** | Interactive test UI |

### Test Types

1. **Component Tests** - Test React components in isolation
2. **Hook Tests** - Test custom React hooks
3. **Integration Tests** - Test component + API interaction
4. **E2E Tests** - See `docs/E2E_TESTING.md`

---

## Test Structure

```
frontend/
├── src/
│ ├── features/
│ │ ├── auth/
│ │ │ ├── components/
│ │ │ │ ├── LoginForm.tsx
│ │ │ │ └── LoginForm.test.tsx # Component test
│ │ │ ├── hooks/
│ │ │ │ ├── useAuth.ts
│ │ │ │ └── useAuth.test.ts # Hook test
│ │ │ └── api/
│ │ │ ├── auth.ts
│ │ │ └── auth.test.ts # API test
│ │ └── products/
│ │ └── ...
│ └── lib/
│ ├── utils.ts
│ └── utils.test.ts # Utility test
├── vitest.config.ts # Vitest configuration
└── test/
 ├── setup.ts # Test setup
 ├── mocks/
 │ ├── handlers.ts # MSW handlers
 │ └── server.ts # MSW server
 └── utils/
 └── test-utils.tsx # Custom render functions
```

---

## Running Tests

### Quick Commands

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test -- --ui

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginForm.test.tsx

# Run tests matching pattern
npm test -- -t "login"

# Update snapshots
npm test -- -u
```

### Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML coverage report
open coverage/index.html
```

---

## Writing Component Tests

### Basic Component Test

**Example**: `src/features/products/components/ProductCard.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
 const mockProduct = {
 id: '1',
 name: 'Test Product',
 price: 29.99,
 stock: 10,
 };

 it('renders product information', () => {
 render(<ProductCard product={mockProduct} />);

 expect(screen.getByText('Test Product')).toBeInTheDocument();
 expect(screen.getByText('$29.99')).toBeInTheDocument();
 expect(screen.getByText('In Stock: 10')).toBeInTheDocument();
 });

 it('calls onAddToCart when add button is clicked', async () => {
 const onAddToCart = vi.fn();
 const user = userEvent.setup();

 render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

 const addButton = screen.getByRole('button', { name: /add to cart/i });
 await user.click(addButton);

 expect(onAddToCart).toHaveBeenCalledWith(mockProduct.id);
 });

 it('shows out of stock badge when stock is 0', () => {
 const outOfStock = { ...mockProduct, stock: 0 };
 render(<ProductCard product={outOfStock} />);

 expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
 });

 it('disables add button when out of stock', () => {
 const outOfStock = { ...mockProduct, stock: 0 };
 render(<ProductCard product={outOfStock} />);

 const addButton = screen.getByRole('button', { name: /add to cart/i });
 expect(addButton).toBeDisabled();
 });
});
```

### Testing with Context Providers

**Example**: Testing components that use auth context

```tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { UserProfile } from './UserProfile';

const renderWithAuth = (ui: React.ReactElement, { user = null } = {}) => {
 return render(
 <AuthProvider initialUser={user}>
 {ui}
 </AuthProvider>
 );
};

describe('UserProfile', () => {
 it('shows login prompt when not authenticated', () => {
 renderWithAuth(<UserProfile />);
 expect(screen.getByText(/please log in/i)).toBeInTheDocument();
 });

 it('shows user info when authenticated', () => {
 const user = { id: '1', email: 'test@example.com', name: 'Test User' };
 renderWithAuth(<UserProfile />, { user });

 expect(screen.getByText('Test User')).toBeInTheDocument();
 expect(screen.getByText('test@example.com')).toBeInTheDocument();
 });
});
```

### Testing Forms

**Example**: `src/features/products/components/ProductForm.test.tsx`

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
 it('submits form with valid data', async () => {
 const onSubmit = vi.fn();
 const user = userEvent.setup();

 render(<ProductForm onSubmit={onSubmit} />);

 // Fill in form
 await user.type(screen.getByLabelText(/name/i), 'New Product');
 await user.type(screen.getByLabelText(/price/i), '29.99');
 await user.type(screen.getByLabelText(/stock/i), '100');

 // Submit
 await user.click(screen.getByRole('button', { name: /submit/i }));

 // Assert
 await waitFor(() => {
 expect(onSubmit).toHaveBeenCalledWith({
 name: 'New Product',
 price: 29.99,
 stock: 100,
 });
 });
 });

 it('shows validation errors for invalid data', async () => {
 const user = userEvent.setup();
 render(<ProductForm onSubmit={vi.fn()} />);

 // Submit without filling form
 await user.click(screen.getByRole('button', { name: /submit/i }));

 // Check for validation errors
 await waitFor(() => {
 expect(screen.getByText(/name is required/i)).toBeInTheDocument();
 expect(screen.getByText(/price is required/i)).toBeInTheDocument();
 });
 });

 it('disables submit button while submitting', async () => {
 const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
 const user = userEvent.setup();

 render(<ProductForm onSubmit={onSubmit} />);

 await user.type(screen.getByLabelText(/name/i), 'Product');
 await user.type(screen.getByLabelText(/price/i), '29.99');

 const submitButton = screen.getByRole('button', { name: /submit/i });
 await user.click(submitButton);

 expect(submitButton).toBeDisabled();
 });
});
```

---

## Writing Hook Tests

### Testing Custom Hooks

**Example**: `src/features/auth/hooks/useAuth.test.ts`

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
 <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
 it('returns null user when not authenticated', () => {
 const { result } = renderHook(() => useAuth(), { wrapper });
 expect(result.current.user).toBeNull();
 expect(result.current.isAuthenticated).toBe(false);
 });

 it('logs in user successfully', async () => {
 const { result } = renderHook(() => useAuth(), { wrapper });

 await result.current.login({
 email: 'test@example.com',
 password: 'password123',
 });

 await waitFor(() => {
 expect(result.current.isAuthenticated).toBe(true);
 expect(result.current.user).not.toBeNull();
 });
 });

 it('logs out user successfully', async () => {
 const { result } = renderHook(() => useAuth(), { wrapper });

 // Login first
 await result.current.login({
 email: 'test@example.com',
 password: 'password123',
 });

 await waitFor(() => {
 expect(result.current.isAuthenticated).toBe(true);
 });

 // Logout
 await result.current.logout();

 await waitFor(() => {
 expect(result.current.isAuthenticated).toBe(false);
 expect(result.current.user).toBeNull();
 });
 });
});
```

### Testing React Query Hooks

**Example**: `src/features/products/hooks/useProducts.test.ts`

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from './useProducts';
import { server } from '@/test/mocks/server';
import { rest } from 'msw';

const createWrapper = () => {
 const queryClient = new QueryClient({
 defaultOptions: {
 queries: { retry: false },
 },
 });

 return ({ children }: { children: React.ReactNode }) => (
 <QueryClientProvider client={queryClient}>
 {children}
 </QueryClientProvider>
 );
};

describe('useProducts', () => {
 it('fetches products successfully', async () => {
 const { result } = renderHook(() => useProducts(), {
 wrapper: createWrapper(),
 });

 await waitFor(() => {
 expect(result.current.isSuccess).toBe(true);
 });

 expect(result.current.data?.items).toHaveLength(10);
 });

 it('handles fetch error', async () => {
 // Mock error response
 server.use(
 rest.get('/api/v1/products', (req, res, ctx) => {
 return res(ctx.status(500), ctx.json({ detail: 'Server error' }));
 })
 );

 const { result } = renderHook(() => useProducts(), {
 wrapper: createWrapper(),
 });

 await waitFor(() => {
 expect(result.current.isError).toBe(true);
 });

 expect(result.current.error).toBeDefined();
 });
});
```

---

## Testing API Integration

### Setting Up MSW

**File**: `test/mocks/handlers.ts`

```tsx
import { rest } from 'msw';

export const handlers = [
 // Auth endpoints
 rest.post('/api/v1/auth/login', (req, res, ctx) => {
 return res(
 ctx.status(200),
 ctx.json({
 access_token: 'fake-token',
 refresh_token: 'fake-refresh-token',
 token_type: 'bearer',
 })
 );
 }),

 // Products endpoints
 rest.get('/api/v1/products', (req, res, ctx) => {
 const page = req.url.searchParams.get('page') || '1';
 const size = req.url.searchParams.get('size') || '10';

 return res(
 ctx.status(200),
 ctx.json({
 items: [
 { id: '1', name: 'Product 1', price: 29.99, stock: 10 },
 { id: '2', name: 'Product 2', price: 49.99, stock: 5 },
 ],
 total: 2,
 page: parseInt(page),
 size: parseInt(size),
 pages: 1,
 })
 );
 }),

 rest.post('/api/v1/products', async (req, res, ctx) => {
 const body = await req.json();
 return res(
 ctx.status(201),
 ctx.json({
 id: '3',
 ...body,
 created_at: new Date().toISOString(),
 })
 );
 }),
];
```

**File**: `test/mocks/server.ts`

```tsx
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**File**: `test/setup.ts`

```tsx
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
import '@testing-library/jest-dom';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

---

## Testing Routing

**Example**: Testing navigation

```tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Navigation } from './Navigation';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
 window.history.pushState({}, 'Test page', route);

 return render(
 <BrowserRouter>
 {ui}
 </BrowserRouter>
 );
};

describe('Navigation', () => {
 it('navigates to products page', async () => {
 const user = userEvent.setup();
 renderWithRouter(<Navigation />);

 const productsLink = screen.getByRole('link', { name: /products/i });
 await user.click(productsLink);

 expect(window.location.pathname).toBe('/products');
 });
});
```

---

## Mocking

### Mocking API Calls

```tsx
import { server } from '@/test/mocks/server';
import { rest } from 'msw';

it('handles API error gracefully', async () => {
 // Override handler for this test
 server.use(
 rest.get('/api/v1/products', (req, res, ctx) => {
 return res(
 ctx.status(500),
 ctx.json({ detail: 'Internal server error' })
 );
 })
 );

 render(<ProductList />);

 await waitFor(() => {
 expect(screen.getByText(/error loading products/i)).toBeInTheDocument();
 });
});
```

### Mocking localStorage

```tsx
const localStorageMock = {
 getItem: vi.fn(),
 setItem: vi.fn(),
 removeItem: vi.fn(),
 clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

it('stores token in localStorage', () => {
 const { result } = renderHook(() => useAuth());

 result.current.login({ email: 'test@test.com', password: 'password' });

 expect(localStorageMock.setItem).toHaveBeenCalledWith(
 'access_token',
 expect.any(String)
 );
});
```

### Mocking Date

```tsx
import { vi } from 'vitest';

it('displays current date', () => {
 const mockDate = new Date('2024-01-15T10:00:00Z');
 vi.setSystemTime(mockDate);

 render(<DateDisplay />);

 expect(screen.getByText('January 15, 2024')).toBeInTheDocument();

 vi.useRealTimers();
});
```

---

## Best Practices

### DO

- [X] **Test user behavior, not implementation**: Focus on what users see and do
- [X] **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
- [X] **Use userEvent over fireEvent**: More realistic user interactions
- [X] **Test loading and error states**: Not just happy path
- [X] **Mock API calls with MSW**: More realistic than mocking fetch
- [X] **Clean up after tests**: Avoid test pollution
- [X] **Use waitFor for async operations**: Don't use arbitrary timeouts
- [X] **Test accessibility**: Use `getByRole` to ensure proper semantics

### DON'T

- [-] **Don't test implementation details**: Avoid testing internal state
- [-] **Don't use getByTestId as default**: Use semantic queries first
- [-] **Don't test third-party libraries**: Trust they work
- [-] **Don't write tests that are too coupled**: Make tests maintainable
- [-] **Don't mock everything**: Test integration where reasonable

---

## Common Patterns

### Testing Permission-Based UI

```tsx
it('shows delete button only for admin users', () => {
 const adminUser = { id: '1', email: 'admin@test.com', role: 'admin' };

 renderWithAuth(<ProductCard product={mockProduct} />, { user: adminUser });

 expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
});

it('hides delete button for regular users', () => {
 const regularUser = { id: '2', email: 'user@test.com', role: 'user' };

 renderWithAuth(<ProductCard product={mockProduct} />, { user: regularUser });

 expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
});
```

### Testing Loading States

```tsx
it('shows loading spinner while fetching', () => {
 render(<ProductList />);

 expect(screen.getByRole('status')).toBeInTheDocument();
 expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('hides loading spinner after fetch completes', async () => {
 render(<ProductList />);

 await waitFor(() => {
 expect(screen.queryByRole('status')).not.toBeInTheDocument();
 });
});
```

### Testing Error Boundaries

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

it('catches and displays error', () => {
 const ThrowError = () => {
 throw new Error('Test error');
 };

 render(
 <ErrorBoundary>
 <ThrowError />
 </ErrorBoundary>
 );

 expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

---

## Troubleshooting

### "Not wrapped in act(...)" Warning

**Cause**: State updates happening outside of React's test environment

**Solution**:
```tsx
import { waitFor } from '@testing-library/react';

await waitFor(() => {
 expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### "Unable to find element" Error

**Cause**: Element not rendered or wrong query

**Solution**:
```tsx
// Debug what's rendered
screen.debug();

// Use better query
// [-] getByText('Submit')
// [X] getByRole('button', { name: /submit/i })

// Check if element exists at all
expect(screen.queryByText('Text')).not.toBeInTheDocument();
```

### Tests Pass Locally But Fail in CI

**Causes**:
- Timing issues (use waitFor)
- Environment differences
- Missing test setup

**Solutions**:
```tsx
// Increase timeout for slow CI
await waitFor(() => {
 expect(screen.getByText('Data')).toBeInTheDocument();
}, { timeout: 5000 });

// Ensure MSW server is set up in test/setup.ts
```

### Memory Leaks in Tests

**Cause**: Not cleaning up subscriptions or timers

**Solution**:
```tsx
afterEach(() => {
 vi.clearAllTimers();
 vi.clearAllMocks();
});
```

---

## Vitest Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
 plugins: [react()],
 test: {
 globals: true,
 environment: 'jsdom',
 setupFiles: ['./test/setup.ts'],
 coverage: {
 provider: 'v8',
 reporter: ['text', 'json', 'html'],
 exclude: [
 'node_modules/',
 'test/',
 '**/*.test.{ts,tsx}',
 '**/types/**',
 ],
 },
 },
 resolve: {
 alias: {
 '@': path.resolve(__dirname, './src'),
 },
 },
});
```

---

## Next Steps

- **E2E Testing**: See `docs/E2E_TESTING.md` for Playwright tests
- **Backend Testing**: See `backend/docs/TESTING.md` for API tests
- **CI/CD**: See `docs/DEPLOYMENT.md` for running tests in CI

---

**Last Updated**: 2026-02-05
