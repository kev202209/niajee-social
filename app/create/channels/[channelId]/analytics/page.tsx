'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Channel } from '@/types';
import { FiUsers, FiVideo, FiEye, FiTrendingUp, FiCalendar, FiLoader } from 'react-icons/fi';
import AuthenticatedImage from "@/components/Image";
import { getImageSrc } from '@/utils/imageUtils';

interface AnalyticsData {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  averageViewDuration: number;
  topVideos: Array<{
    id: string;
    title: string;
    views: number;
    thumbnail: string;
  }>;
  recentActivity: Array<{
    date: string;
    views: number;
    subscribers: number;
  }>;
}

interface RawAnalyticsResponse {
  success?: boolean;
  data?: {
    totalViews?: number;
    totalSubscribers?: number;
    totalVideos?: number;
    averageViewDuration?: number;
    topVideos?: Array<{
      id: string;
      title: string;
      views: number;
      thumbnail: string;
    }>;
    recentActivity?: Array<{
      date: string;
      views: number;
      subscribers: number;
    }>;
  };
  message?: string;
}

export default function ChannelAnalyticsPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchChannelData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch channel info
      const channelResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`,
        { credentials: 'include' }
      );

      if (!channelResponse.ok) return;

      // Replace explicit any with a typed union
      // type ChannelApiResponse = Channel | { channel: Channel };

      const rawChannel = await channelResponse.json() as unknown;

      let c: Channel | null = null;
      if (rawChannel && typeof rawChannel === 'object') {
        if ('channel' in (rawChannel as Record<string, unknown>) && (rawChannel as { channel?: unknown }).channel) {
          c = (rawChannel as { channel: Channel }).channel;
        } else {
          c = rawChannel as Channel;
        }
      }

      if (!c) return;

      setChannel(c);

      // Fetch analytics with selected time range
      let analyticsData: AnalyticsData | null = null;
      try {
        const analyticsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/analytics?range=${timeRange}`,
          { credentials: 'include' }
        );

        if (analyticsRes.ok) {
          const raw: unknown = await analyticsRes.json();
          const parsed = raw as RawAnalyticsResponse;
          if (parsed.success && parsed.data) {
            analyticsData = {
              totalViews: parsed.data.totalViews ?? c.viewCount ?? 0,
              totalSubscribers: parsed.data.totalSubscribers ?? c.subscriberCount ?? 0,
              totalVideos: parsed.data.totalVideos ?? c.videoCount ?? 0,
              averageViewDuration: parsed.data.averageViewDuration ?? 0,
              topVideos: parsed.data.topVideos ?? [],
              recentActivity: parsed.data.recentActivity ?? []
            };
          }
        }
      } catch (err) {
        console.warn('Analytics endpoint unavailable, using fallback.', err);
      }

      // Fallback (mock) if real analytics not available
      if (!analyticsData) {
        analyticsData = {
          totalViews: c.viewCount || 0,
          totalSubscribers: c.subscriberCount || 0,
            totalVideos: c.videoCount || 0,
          averageViewDuration: 0,
          topVideos: [],
          recentActivity: []
        };
      }

      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [channelId, timeRange]); // timeRange now genuinely used

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);
 
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!channel || !analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your channel&apos;s performance and growth
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalViews.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">+0% from last period</p>
            </div>
            <FiEye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalSubscribers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">+0% from last period</p>
            </div>
            <FiUsers className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalVideos.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">+0% from last period</p>
            </div>
            <FiVideo className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Watch Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.averageViewDuration}m
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">+0% from last period</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Views Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Views Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Chart placeholder - integrate with your preferred charting library</p>
          </div>
        </div>

        {/* Subscribers Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscriber Growth</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Chart placeholder - integrate with your preferred charting library</p>
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Videos</h3>
        </div>
        <div className="p-6">
          {analytics.topVideos.length === 0 ? (
            <div className="text-center py-8">
              <FiVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No videos to analyze yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Upload some videos to see performance metrics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topVideos.map((video, index) => (
                <div key={video.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}
                  </span>
                  <div className="relative w-16 h-12">
                    <AuthenticatedImage
                      mediaKey={ getImageSrc(video.thumbnail, '480w')}
                      alt={video.title}
                      fill
                      className="object-cover rounded"
                      sizes="64px"
                      fallbackSrc="/placeholder-video.jpg"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{video.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
