'use client';

import React, { useEffect, useState, FC } from 'react';
import { Channel } from '@/types';
import { FiUsers, FiVideo, FiEye, FiPlus, FiTrendingUp, FiUpload, FiPlayCircle } from 'react-icons/fi';
import Link from 'next/link';
import AuthenticatedImage from '@/components/Image';
import { getImageSrc } from '../utils/imageUtils';

interface DashboardStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalChannels: number;
}

const CreateDashboard: FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalSubscribers: 0,
    totalVideos: 0,
    totalChannels: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch channels
        const channelsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/my-channel`, {
          credentials: 'include'
        });
        const channelsData = await channelsRes.json();
        const channelsList = channelsData.channels || [];
        setChannels(channelsList);

        // Calculate stats
        const totalStats = channelsList.reduce((acc: DashboardStats, channel: Channel) => ({
          totalViews: acc.totalViews + (channel.viewCount || 0),
          totalSubscribers: acc.totalSubscribers + (channel.subscriberCount || 0),
          totalVideos: acc.totalVideos + (channel.videoCount || 0),
          totalChannels: acc.totalChannels + 1
        }), { totalViews: 0, totalSubscribers: 0, totalVideos: 0, totalChannels: 0 });

        setStats(totalStats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Creator Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Manage your channels and content from one place
        </p>
      </header>

      {/* Quick Stats - Enhanced mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
            </div>
            <FiEye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubscribers.toLocaleString()}</p>
            </div>
            <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVideos.toLocaleString()}</p>
            </div>
            <FiVideo className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Channels</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalChannels}</p>
            </div>
            <FiPlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions - Better mobile grid */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/create/channels/new"
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg hover:shadow-md transition-shadow"
          >
            <FiPlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 text-center">Create Channel</span>
          </Link>
          <Link
            href="/create/channels"
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg hover:shadow-md transition-shadow"
          >
            <FiUpload className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100 text-center">Upload Video</span>
          </Link>
          <Link
            href="/create/channels"
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg hover:shadow-md transition-shadow"
          >
            <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100 text-center">View Analytics</span>
          </Link>
          <Link
            href="/create/channels"
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg hover:shadow-md transition-shadow"
          >
            <FiPlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 mb-2" />
            <span className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100 text-center">Go Live</span>
          </Link>
        </div>
      </div>

      {/* Recent Channels - Enhanced mobile layout */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Your Channels</h2>
          <Link
            href="/create/channels"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {channels.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiVideo className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No channels yet</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">Create your first channel to get started</p>
            <Link
              href="/create/channels/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus className="w-4 h-4" />
              Create Channel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {channels.slice(0, 6).map((channel) => {
              // Get the image source safely
              const avatarSrc = getImageSrc(channel.avatar, '480w');
              
              return (
                <Link
                  key={channel.id}
                  href={`/create/channels/${channel.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {avatarSrc ? (
                          <AuthenticatedImage 
                            mediaKey={avatarSrc}
                            alt={channel.name} 
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover" 
                            fallbackSrc="/placeholder.png"
                          />
                        ) : (
                          <FiVideo className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{channel.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">@{channel.handle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                      <div>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{channel.subscriberCount || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Subscribers</p>
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{channel.videoCount || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
                      </div>
                      <div>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">{channel.viewCount || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDashboard;