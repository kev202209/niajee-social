'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import {
  Rocket,
  Film,
  Upload,
  Video,
  Sliders,
  ImageIcon,
  Settings2,
} from 'lucide-react'

interface SidebarProps {
  isSidebarOpen: boolean
}

const Sidebar: FC<SidebarProps> = ({ isSidebarOpen }) => {
  const pathname = usePathname()

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen pt-16
        bg-gray-100 dark:bg-gray-900
        transition-all duration-300 ease-in-out
        z-20
        ${isSidebarOpen
          ? 'w-25 md:w-40' 
          : 'w-10'}
      `}
    >
      <nav className="flex flex-col pt-4 h-full w-full">
        {[
          { label: 'Go Live',     icon: Rocket,    href: '' },
          { label: 'Channels',    icon: Film,      href: '/create/channels' },
          { label: 'Upload',      icon: Upload,    href: '/create/upload' },
          { label: 'Editor',      icon: Video,     href: '/create/editor' },
          { label: 'Analytics',   icon: Sliders,   href: '/create/analytics' },
          { label: 'Branding',    icon: ImageIcon, href: '/create/branding' },
          { label: 'Settings',    icon: Settings2, href: '/create/settings' },
        ].map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center p-2 rounded-lg font-medium
              transition-all duration-300 ease-in-out
              ${pathname.startsWith(href)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span
              className={`
                ml-3 flex-1 whitespace-nowrap transition-all duration-300
                ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
                md:opacity-100 md:w-auto md:overflow-visible
              `}
            >
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
