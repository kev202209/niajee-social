'use client';

import React, { useEffect, useState, FC } from 'react';
import { Channel } from '@/types';
import { FiSettings, FiUsers, FiVideo, FiEye, FiPlus, FiRefreshCw } from 'react-icons/fi';

const ChannelsPage: FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchChannels = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/my-channel`,
        {
          method: 'GET',
          credentials: 'include',
          signal
        }
      );
      
      if (signal?.aborted) {
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (!signal?.aborted) {
        // Extract the channels array from the response
        setChannels(data.channels || []);
      }
    } catch (err: any) {
      if (!signal?.aborted && (err as Error).name !== 'AbortError') {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load channels.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchChannels(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, []);

  const handleManage = (channelId: string) => {
    window.location.href = `/create/channels/${channelId}`;
  };

  const handleCreateChannel = () => {
    window.location.href = '/create/channels/new';
  };
  const handleRetry = () => {
    fetchChannels();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Channels
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your channels and content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh channels"
            >
              <FiRefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCreateChannel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Create Channel
            </button>
          </div>
        </header>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <FiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-8">
              <FiVideo className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No channels yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Create your first channel to start sharing videos and building your community
              </p>
            </div>
            <button
              onClick={handleCreateChannel}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Channel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Channel Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {channel.banner && (
                    <img
                      src={channel.banner}
                      alt={`${channel.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Channel Avatar */}
                  <div className="absolute -bottom-6 left-4">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
                      {channel.avatar ? (
                        <img
                          src={channel.avatar}
                          alt={channel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FiVideo className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Channel Info */}
                <div className="p-4 pt-8">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{channel.handle}
                    </p>
                    {channel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {channel.description}
                      </p>
                    )}
                  </div>

                  {/* Channel Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <FiUsers className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {channel.subscriberCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Subscribers</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <FiVideo className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {channel.videoCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Videos</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <FiEye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {channel.viewCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Views</span>
                    </div>
                  </div>

                  {/* Channel Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      channel.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {channel.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleManage(channel.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <FiSettings className="w-4 h-4" />
                    Manage Channel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsPage;
