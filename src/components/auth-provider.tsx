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
      const token = localStorage.getItem("access_token")

      if (token) {
        try {
          // Try to fetch current user with existing token
          const user = await authApi.getCurrentUser()
          setUser(user)

          // Set permissions based on user role
          const permissions: string[] = []
          if (user.is_admin) {
            permissions.push("users:read", "users:write", "users:delete")
          }
          setPermissions(permissions)
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          setUser(null)
          setPermissions([])
        }
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
