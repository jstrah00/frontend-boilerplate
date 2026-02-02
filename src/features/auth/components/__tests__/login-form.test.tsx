import { describe, it, expect } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { LoginForm } from "../login-form"

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe("LoginForm", () => {
  it("renders login form with email and password fields", () => {
    render(<LoginForm />, { wrapper: createWrapper() })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })

    const submitButton = screen.getByRole("button", { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "invalid-email")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it("submits form with valid credentials", async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "admin@example.com")
    await user.type(passwordInput, "admin123")
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/signing in/i)
    })
  })
})
