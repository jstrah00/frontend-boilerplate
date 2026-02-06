import { useEffect, useState } from "react"
import { useAuth } from "@/store"
import { authApi } from "@/features/auth/api/auth.api"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setPermissions } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to fetch current user (auth via HttpOnly cookies)
        // If cookies are valid, this will succeed
        const user = await authApi.getCurrentUser()
        setUser(user)

        // Set permissions from backend (already computed)
        const permissions = user.permissions || []
        setPermissions(permissions)
      } catch (error) {
        // No valid session - cookies expired or don't exist
        // Backend handles cookie cleanup
        setUser(null)
        setPermissions([])
      }

      setIsLoading(false)
    }

    initAuth()
  }, [setUser, setPermissions])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return <>{children}</>
}
