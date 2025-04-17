'use client'

import { useState } from 'react'
import CreateHeader from '@/components/create/Header'
import Link from 'next/link'
import {
  Rocket,
  Film,
  Upload,
  Video,
  Sliders,
  ImageIcon,
  Settings2,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

const sidebarItems = [
  { label: 'Go Live', icon: Rocket, href: '/create/live' },
  { label: 'Channels', icon: Film, href: '/create/channels' },
  { label: 'Upload', icon: Upload, href: '/create/upload' },
  { label: 'Editor', icon: Video, href: '/create/editor' },
  { label: 'Analytics', icon: Sliders, href: '/create/analytics' },
  { label: 'Branding', icon: ImageIcon, href: '/create/branding' },
  { label: 'Settings', icon: Settings2, href: '/create/settings' },
]

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen pt-16
          bg-white dark:bg-gray-900 z-40
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ?  'w-25 md:w-40' : 'w-10'}
        `}
        
      >
        <nav className="flex flex-col pt-4 h-full w-full">
          {sidebarItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center p-2 rounded-lg font-medium transition
                ${pathname.startsWith(href)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`
                  ml-3 whitespace-nowrap transition-all duration-300
                  ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
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
            ${isSidebarOpen ? 'ml-25 md:ml-40' : 'ml-10'}
          `}
        >
          <div className="">{children}</div>
        </main>
      </div>
    </div>
  )
}
