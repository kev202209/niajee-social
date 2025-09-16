'use client'

import { useState, useEffect } from 'react'
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
]

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed on mobile
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true) // Auto-open on desktop
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Check if we're in a channel-specific route
  const isChannelRoute = pathname.match(/^\/create\/channels\/[^\/]+/)
  
  // If we're in a channel route, just render children without the layout
  if (isChannelRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen pt-16 z-40
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-16'}
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : ''}
        `}
      >
        <nav className="flex flex-col pt-6 h-full px-4 overflow-hidden">
          {sidebarItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => isMobile && setIsSidebarOpen(false)}
              className={`flex items-center p-3 rounded-lg font-medium transition mb-1
                ${pathname === href
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`
                  ml-3 whitespace-nowrap transition-all duration-300
                  ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden lg:opacity-0'}
                `}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <CreateHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Page content */}
        <main
          className={`
            pt-16 h-full overflow-y-auto transition-all duration-300
            ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0 lg:ml-16'}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
