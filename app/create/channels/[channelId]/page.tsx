'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Channel } from '@/types'
import { FiUsers, FiVideo, FiEye, FiTrendingUp } from 'react-icons/fi'

export default function ChannelOverview() {
  const params = useParams()
  const channelId = params.channelId as string
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
          credentials: 'include'
        })
        const data = await res.json()
        setChannel(data.channel)
      } catch (error) {
        console.error('Failed to fetch channel:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChannelData()
  }, [channelId])

  if (loading) {
    return <div className="p-8">Loading channel data...</div>
  }

  if (!channel) {
    return <div className="p-8">Channel not found</div>
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {channel.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Channel Overview
        </p>
      </header>

      {/* Channel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(channel.subscriberCount || 0).toLocaleString()}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(channel.videoCount || 0).toLocaleString()}
              </p>
            </div>
            <FiVideo className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(channel.viewCount || 0).toLocaleString()}
              </p>
            </div>
            <FiEye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">No recent activity to show.</p>
        </div>
      </div>
    </div>
  )
}