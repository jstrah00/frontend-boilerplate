import { ReactNode } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-4 pb-6 px-2 sm:pt-6 sm:px-4 md:px-6 md:ml-64 overflow-x-hidden min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  )
}
