'use client'

import CreateHeader from '@/components/create/Header'
import Link from 'next/link'
import {
  Home,
  Film,
  Plus,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

const sidebarItems = [
  { label: 'Dashboard', icon: Home, href: '/create' },
  { label: 'Channels', icon: Film, href: '/create/channels' },
  { label: 'Create Channel', icon: Plus, href: '/create/channels/new' },
] as const

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if we're in ANY channel-specific route (but NOT /new or /channels root)
  // This includes: /create/channels/{id}, /create/channels/{id}/upload, etc.
  const isChannelSpecificRoute = Boolean(
    pathname.match(/^\/create\/channels\/[^/]+/) && 
    !pathname.endsWith('/new') &&
    pathname !== '/create/channels'
  )
  
  // If we're in any channel-specific route, render without this layout
  // The channel-specific layout will handle it instead
  if (isChannelSpecificRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block fixed top-0 left-0 h-screen pt-16 z-40 w-64
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
      >
        <nav className="flex flex-col pt-6 h-full px-4 overflow-hidden">
          {sidebarItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center p-3 rounded-lg font-medium transition mb-1
                ${pathname === href
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 whitespace-nowrap">
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <CreateHeader toggleSidebar={() => {}} />

        {/* Page content */}
        <main
          className="pt-16 pb-20 lg:pb-0 h-full overflow-y-auto lg:ml-64"
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
          <div className="grid grid-cols-3 h-16">
            {sidebarItems.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 transition
                  ${pathname === href
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
                `}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
