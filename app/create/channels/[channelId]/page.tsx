'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DetailedChannel as Channel } from '@/types'
import { FiUsers, FiVideo, FiEye, FiTrendingUp, FiClock, FiPlay, FiCalendar, FiSmartphone } from 'react-icons/fi'
import ChannelOverviewSkeleton from './ChannelOverviewSkeleton'
import AuthenticatedImage from "@/components/Image"; // Add this import at the top
import timeAgo from '@/utils/timeAgo';
import { getImageSrc } from '@/utils/imageUtils';

interface ChannelStats {
  totalViews: number | null;
  totalSubscribers: number | null;
  totalVideos: number | null;
  totalShorts: number | null;
  totalWatchTime: number | null; // in minutes
  subscriberGrowth: number | null;
  viewGrowth: number | null;
  videoGrowth: number | null;
  watchTimeGrowth: number | null;
}

interface RecentActivity {
  id: string;
  type: 'video_published' | 'subscriber_milestone' | 'analytics_updated' | 'live_stream' | 'short_published';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface ChannelOverview {
  channel: Channel;
  stats: ChannelStats;
  recentActivity: RecentActivity[];
}

export default function ChannelOverview() {
  const params = useParams()
  const router = useRouter()
  const channelId = params.channelId as string
  
  const [overview, setOverview] = useState<ChannelOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const fetchChannelOverview = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch channel overview data
      const overviewResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/overview`, {
        credentials: 'include',
        signal: signal
      })
      
      // Check if the request was aborted
      if (signal?.aborted) {
        return
      }
      
      if (!overviewResponse.ok) {
        throw new Error('Failed to fetch channel overview')
      }
      
      const overviewData = await overviewResponse.json()
      
      // Check again if the request was aborted after parsing
      if (signal?.aborted) {
        return
      }
      
      // Fetch channel stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/stats`, {
        credentials: 'include',
        signal: signal
      })
      
      // Check if the request was aborted
      if (signal?.aborted) {
        return
      }
      
      let statsData = null
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        statsData = stats.stats
      }
      
      // Final check before setting state
      if (signal?.aborted) {
        return
      }
      
      // Combine the data
      const combinedData: ChannelOverview = {
        channel: overviewData.channel || overviewData,
        stats: statsData || {
          totalViews: overviewData.channel?.viewCount || 0,
          totalSubscribers: overviewData.channel?.subscriberCount || 0,
          totalVideos: overviewData.channel?.videoCount || 0,
          totalShorts: overviewData.channel?.shortCount || 0,
          totalWatchTime: 0,
          subscriberGrowth: 0,
          viewGrowth: 0,
          videoGrowth: 0,
          watchTimeGrowth: 0,
        },
        recentActivity: overviewData.recentActivity || []
      }
      
      setOverview(combinedData)
    } catch (error) {
      // Don't update state if the request was aborted
      if (signal?.aborted || (error as Error).name === 'AbortError') {
        return
      }
      console.error('Failed to fetch channel overview:', error)
      setError('Failed to load channel data')
    } finally {
      // Only update loading state if not aborted
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [channelId])

  useEffect(() => {
    const abortController = new AbortController()
    fetchChannelOverview(abortController.signal)
    return () => abortController.abort()
  }, [fetchChannelOverview])

  const formatNumber = (num: number | undefined | null): string => {
    // Handle undefined, null, or NaN values
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatWatchTime = (minutes: number | undefined | null): string => {
    // Handle undefined, null, or NaN values
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes === 0) {
      return '0m'
    }
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      if (hours >= 24) {
        const days = Math.floor(hours / 24)
        return `${days}d ${hours % 24}h`
      }
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const getGrowthColor = (growth: number | undefined | null): string => {
    if (growth === undefined || growth === null || isNaN(growth)) {
      return 'text-gray-500 dark:text-gray-400'
    }
    if (growth > 0) return 'text-green-600 dark:text-green-400'
    if (growth < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-500 dark:text-gray-400'
  }

  const getGrowthText = (growth: number | undefined | null): string => {
    if (growth === undefined || growth === null || isNaN(growth)) {
      return 'No data available'
    }
    if (growth === 0) return '+0% from last period'
    const sign = growth > 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}% from last period`
  }

  const getActivityIcon = (type: string): React.ReactElement => {
    switch (type) {
      case 'video_published':
        return <FiVideo className="w-4 h-4 text-gray-400" />
      case 'short_published':
        return <FiSmartphone className="w-4 h-4 text-gray-400" />
      case 'subscriber_milestone':
        return <FiUsers className="w-4 h-4 text-gray-400" />
      case 'analytics_updated':
        return <FiTrendingUp className="w-4 h-4 text-gray-400" />
      case 'live_stream':
        return <FiPlay className="w-4 h-4 text-gray-400" />
      default:
        return <FiCalendar className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'video_published':
      case 'short_published':
        return 'bg-green-500'
      case 'subscriber_milestone':
        return 'bg-blue-500'
      case 'analytics_updated':
        return 'bg-purple-500'
      case 'live_stream':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }


  const navigateToPage = (path: string) => {
    router.push(`/create/channels/${channelId}${path}`)
  }

  // Show skeleton while loading
  if (loading) {
    return <ChannelOverviewSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button 
            onClick={() => fetchChannelOverview()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!overview?.channel) {
    return (
      <div className="p-8 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">Channel not found</p>
          <Link
            href="/create/channels"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Channels
          </Link>
        </div>
      </div>
    )
  }

  const { channel, stats, recentActivity } = overview

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {channel.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {channel.handle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Channel Overview & Analytics
            </p>
          </div>
          
          {/* Channel Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            {channel.avatar ? (
              <AuthenticatedImage
                mediaKey={getImageSrc(channel.avatar, '480w')}
                alt={channel.name}
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover"
                fallbackSrc="/placeholder.png"
              />
            ) : (
              <FiVideo className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
        
        {/* Channel Description */}
        {channel.description && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">{channel.description}</p>
          </div>
        )}
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalSubscribers ?? 0)}
              </p>
              <p className={`text-xs mt-1 ${getGrowthColor(stats.subscriberGrowth)}`}>
                {getGrowthText(stats.subscriberGrowth)}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Content</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber((stats.totalVideos ?? 0) + (stats.totalShorts ?? 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.totalVideos ?? 0} videos, {stats.totalShorts ?? 0} shorts
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
                {formatNumber(stats.totalViews ?? 0)}
              </p>
              <p className={`text-xs mt-1 ${getGrowthColor(stats.viewGrowth)}`}>
                {getGrowthText(stats.viewGrowth)}
              </p>
            </div>
            <FiEye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Watch Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatWatchTime(stats.totalWatchTime ?? 0)}
              </p>
              <p className={`text-xs mt-1 ${getGrowthColor(stats.watchTimeGrowth)}`}>
                {getGrowthText(stats.watchTimeGrowth)}
              </p>
            </div>
            <FiClock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.description} • {timeAgo(activity.timestamp)}
                      </p>
                    </div>
                    {getActivityIcon(activity.type)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Start creating content to see activity here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigateToPage('/upload')}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition text-center group"
              >
                <FiVideo className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Upload Content</p>
              </button>
              
              <button 
                onClick={() => navigateToPage('/analytics')}
                className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition text-center group"
              >
                <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">View Analytics</p>
              </button>
              
              <button 
                onClick={() => navigateToPage('/live')}
                className="p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition text-center group"
              >
                <FiPlay className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Go Live</p>
              </button>
              
              <button 
                onClick={() => navigateToPage('/settings')}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition text-center group"
              >
                <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Channel Settings</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
