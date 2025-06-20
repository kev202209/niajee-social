'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { Channel } from '@/types'
import {
  BarChart,
  Upload,
  Settings,
  Palette,
  Video,
  Radio,
  Home
} from 'lucide-react'

const channelSidebarItems = [
  { label: 'Overview', icon: Home, href: '' },
  { label: 'Analytics', icon: BarChart, href: '/analytics' },
  { label: 'Upload', icon: Upload, href: '/upload' },
  { label: 'Editor', icon: Video, href: '/editor' },
  { label: 'Live', icon: Radio, href: '/live' },
  { label: 'Branding', icon: Palette, href: '/branding' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const channelId = params.channelId as string
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
          credentials: 'include'
        })
        const data = await res.json()
        setChannel(data.channel)
      } catch (error) {
        console.error('Failed to fetch channel:', error)
      }
    }

    if (channelId) {
      fetchChannel()
    }
  }, [channelId])

  const baseHref = `/create/channels/${channelId}`

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Channel Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* Channel Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {channel?.avatar ? (
                <img src={channel.avatar} alt={channel.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Video className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {channel?.name || 'Loading...'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                @{channel?.handle || '...'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {channelSidebarItems.map(({ label, icon: Icon, href }) => {
            const fullHref = baseHref + href
            const isActive = pathname === fullHref
            
            return (
              <Link
                key={label}
                href={fullHref}
                className={`flex items-center p-3 rounded-lg font-medium transition mb-1
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Channel Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}