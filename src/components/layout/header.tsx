import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { UserMenu } from './user-menu'
import { useUI } from '@/store'

export function Header() {
  const { t } = useTranslation()
  const { toggleSidebar } = useUI()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-3 sm:px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden h-9 w-9" aria-label={t('ui.openMenu')}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="mr-4 flex">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-semibold text-sm sm:text-base">Frontend Boilerplate</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
