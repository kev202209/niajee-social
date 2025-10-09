'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  Upload,
  Settings,
  Home,
  PlaySquare,
  Video
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { DetailedChannel as Channel } from '@/types'
import CreateHeader from '@/components/create/Header'

const channelMenuItems = [
  { label: 'Overview', icon: Home, href: '' },
  { label: 'Upload', icon: Upload, href: '/upload' },
  { label: 'Manage', icon: Video, href: '/manage-uploads' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
] as const

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const channelId = params.channelId as string
  
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchChannel = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`,
        { credentials: 'include' }
      )
      
      if (response.ok) {
        const data = await response.json() as unknown
        let channelData: Channel | null = null

        if (data && typeof data === 'object' && 'channel' in data) {
          const wrapped = data as { channel?: Channel }
          channelData = wrapped.channel ?? null
        } else {
          channelData = data as Channel | null
        }

        setChannel(channelData)
      }
    } catch (error) {
      console.error('Error fetching channel:', error)
    } finally {
      setLoading(false)
    }
  }, [channelId])

  useEffect(() => {
    fetchChannel()
  }, [fetchChannel])

  const isActiveRoute = (href: string) => {
    const fullPath = `/create/channels/${channelId}${href}`
    return pathname === fullPath
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen pt-16 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Channel Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : channel ? (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {channel.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {channel.handle}
              </p>
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col pt-4 px-4 overflow-y-auto pb-20">
          {channelMenuItems.map(({ label, icon: Icon, href }) => {
            const fullPath = `/create/channels/${channelId}${href}`
            const isActive = isActiveRoute(href)
            
            return (
              <Link
                key={label}
                href={fullPath}
                className={`flex items-center p-3 rounded-lg font-medium transition mb-1 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap">{label}</span>
              </Link>
            )
          })}

          {/* Back to Channels */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => router.push('/create/channels')}
              className="w-full flex items-center p-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <PlaySquare className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 whitespace-nowrap">All Channels</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <CreateHeader toggleSidebar={() => {}} isSidebarOpen={false} />

        {/* Page content */}
        <main className="pt-16 pb-20 lg:pb-0 h-full overflow-y-auto lg:ml-64">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
          <div className="grid grid-cols-5 h-16">
            {channelMenuItems.map(({ label, icon: Icon, href }) => {
              const fullPath = `/create/channels/${channelId}${href}`
              const isActive = isActiveRoute(href)
              
              return (
                <Link
                  key={label}
                  href={fullPath}
                  className={`flex flex-col items-center justify-center gap-1 transition ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      <style jsx>{`
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  )
}