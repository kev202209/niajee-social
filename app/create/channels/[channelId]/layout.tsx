'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' // Add this import
import { usePathname, useParams } from 'next/navigation'
import { DetailedChannel as Channel } from '@/types'
import CreateHeader from '@/components/create/Header'
import {
  BarChart,
  Upload,
  Settings,
  Palette,
  Video,
  Radio,
  Home,
  ArrowLeft
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchChannel = async (signal: AbortSignal) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
          credentials: 'include',
          signal
        })
        
        if (signal.aborted) {
          return
        }
        
        const data = await res.json()
        
        if (!signal.aborted) {
          setChannel(data.channel || data)
        }
      } catch (error) {
        if (!signal.aborted && (error as Error).name !== 'AbortError') {
          console.error('Failed to fetch channel:', error)
        }
      }
    }

    if (channelId) {
      fetchChannel(abortController.signal)
    }
    
    return () => {
      abortController.abort()
    }
  }, [channelId])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const baseHref = `/create/channels/${channelId}`

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Channel Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen pt-16
          bg-white dark:bg-gray-900 z-40 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Back to Channels Link */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/create/channels"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span
              className={`
                ml-2 whitespace-nowrap transition-all duration-300
                ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Back to Channels
            </span>
          </Link>
        </div>

        {/* Channel Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {channel?.avatar ? (
                <Image 
                  src={channel.avatar} 
                  alt={channel.name} 
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <Video className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`
                flex-1 min-w-0 transition-all duration-300
                ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
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
        <nav className="p-4 flex-1 overflow-y-auto">
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
                <span
                  className={`
                    ml-3 whitespace-nowrap transition-all duration-300
                    ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
                  `}
                >
                  {label}
                </span>
              </Link>
            )
          })}
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
            ${isSidebarOpen ? 'ml-64' : 'ml-16'}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  )
}