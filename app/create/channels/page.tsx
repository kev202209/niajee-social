'use client';

import React, { useEffect, useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedImage from "@/components/Image";
import { DetailedChannel as Channel } from '@/types';
import { FiSettings, FiUsers, FiVideo, FiEye, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { getImageSrc } from '@/utils/imageUtils';

const ChannelsPage: FC = () => {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchChannels = async (signal?: AbortSignal): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/my-channels`,
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

      interface MyChannelsResponse {
        channels?: Channel[];
      }

      const data = await res.json() as unknown;

      if (!signal?.aborted) {
        const parsed = (data && typeof data === 'object' && 'channels' in (data as Record<string, unknown>))
          ? (data as MyChannelsResponse).channels ?? []
          : [];
        setChannels(parsed);
      }
    } catch (err: unknown) {
      if (!signal?.aborted && (err as Error).name !== 'AbortError') {
        console.error('Fetch error:', err);
        setError((err as Error).message || 'Failed to load channels.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    void fetchChannels(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, []);

  const handleManage = (channelId: string) => {
    router.push(`/create/channels/${channelId}`);
  };

  const handleCreateChannel = () => {
    router.push('/create/channels/new');
  };
  
  const handleRetry = () => {
    void fetchChannels();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header: Improved mobile layout */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              My Channels
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
              Manage your channels and content
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh channels"
              aria-label="Refresh channels"
            >
              <FiRefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCreateChannel}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden xs:inline">Create Channel</span>
              <span className="xs:hidden">Create</span>
            </button>
          </div>
        </header>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-24 sm:h-32 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-3 sm:p-4">
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
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16">
            <div className="text-center max-w-md px-4">
              <FiVideo className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center px-4">
            <div className="mb-6 sm:mb-8">
              <FiVideo className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No channels yet
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Create your first channel to start sharing videos and building your community
              </p>
            </div>
            <button
              onClick={handleCreateChannel}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-base sm:text-lg"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Your First Channel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {channels.map((ch: Channel) => (
              <div
                key={ch.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Channel Banner */}
                <div className="h-20 sm:h-24 lg:h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {ch.banner ? (
                    <div className="relative w-full h-full">
                      <AuthenticatedImage
                        mediaKey={getImageSrc(ch.banner, '1080w')}
                        alt={`${ch.name} banner`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        fallbackSrc="/placeholder-banner.png"
                      />
                    </div>
                  ) : null}
                  
                  {/* Channel Avatar */}
                  <div className="absolute -bottom-5 sm:-bottom-6 left-3 sm:left-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full border-2 sm:border-4 border-white dark:border-gray-800 overflow-hidden">
                      {ch.avatar ? (
                        <div className="relative w-full h-full">
                          <AuthenticatedImage
                            mediaKey={getImageSrc(ch.avatar, '480w')}
                            alt={ch.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            fallbackSrc="/placeholder.png"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FiVideo className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Channel Info */}
                <div className="p-3 sm:p-4 pt-6 sm:pt-8">
                  <div className="mb-2 sm:mb-3">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {ch.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      @{ch.handle}
                    </p>
                    {ch.description && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {ch.description}
                      </p>
                    )}
                  </div>

                  {/* Channel Stats */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <FiUsers className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {ch.subscriberCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Subs</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <FiVideo className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {ch.videoCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Videos</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <FiEye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {ch.viewCount || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Views</span>
                    </div>
                  </div>

                  {/* Channel Status */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      ch.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {ch.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {ch.isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleManage(ch.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium text-sm sm:text-base"
                  >
                    <FiSettings className="w-4 h-4" />
                    <span>Manage</span>
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

// If not already declared, add a minimal type for list items (adjust fields to what you actually use)
// interface ChannelSummary {
//   id: string;
//   name: string;
//   handle: string;
//   avatar?: string | null;
//   banner?: string | null;
//   description?: string | null;
//   subscriberCount?: number;
//   videoCount?: number;
//   viewCount?: number;
//   isActive?: boolean;
//   isVerified?: boolean;
// }
