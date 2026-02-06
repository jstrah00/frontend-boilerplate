import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Users, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Can } from '@/components/can'
import { useTranslation } from 'react-i18next'
import { useUI } from '@/store'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

export function Sidebar() {
  const { t } = useTranslation()
  const { sidebarCollapsed, setSidebarCollapsed } = useUI()

  const handleNavClick = () => {
    // Close sidebar on mobile when a nav item is clicked
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true)
    }
  }

  const navItems: NavItem[] = [
    { path: '/', label: t('navigation.dashboard'), icon: LayoutDashboard },
    { path: '/items', label: t('navigation.items'), icon: Package },
    { path: '/chat', label: t('navigation.chat'), icon: MessageCircle },
    {
      path: '/users',
      label: t('navigation.users'),
      icon: Users,
      permission: 'users:read',
    },
    { path: '/profile', label: t('navigation.profile'), icon: User },
  ]

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform md:translate-x-0',
        sidebarCollapsed && '-translate-x-full'
      )}
    >
      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          if (item.permission) {
            return (
              <Can key={item.path} perform={item.permission}>
                <NavItem item={item} onClick={handleNavClick} />
              </Can>
            )
          }
          return <NavItem key={item.path} item={item} onClick={handleNavClick} />
        })}
      </nav>
    </aside>
  )
}

function NavItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive && 'bg-accent text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  )
}
