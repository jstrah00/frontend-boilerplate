import { ReactNode } from 'react'
import { useAuth } from '@/store'

interface CanProps {
  perform: string | string[]
  yes?: () => ReactNode
  no?: () => ReactNode
  children?: ReactNode
}

export function Can({ perform, yes, no, children }: CanProps) {
  const { permissions } = useAuth()

  const hasPermission = () => {
    if (Array.isArray(perform)) {
      return perform.some((p) => permissions.includes(p))
    }
    return permissions.includes(perform)
  }

  if (hasPermission()) {
    if (yes) return <>{yes()}</>
    return <>{children}</>
  }

  if (no) return <>{no()}</>
  return null
}
