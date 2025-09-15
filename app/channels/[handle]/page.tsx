'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthenticatedImage from '@/components/Image';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import { FiUsers, FiVideo, FiPlay, FiBell } from 'react-icons/fi';
import { getImageSrc } from '@/app/utils/imageUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Added minimal interfaces for typing (only the fields actually used in this component)
interface Channel {
  id: string;
  avatar: string;
  name: string;
  handle: string;
  description?: string;
}

interface ChannelStats {
  subscriberCount?: number;
  videoCount?: number;
  shortCount?: number;
  isSubscribed?: boolean;
}

interface MediaItem {
  id: string;
  thumbnail: string;
  title: string;
  views?: number;
  publishedAt?: string;
  duration?: string; // videos only
}

interface ChannelOverview {
  stats?: ChannelStats;
  videos?: MediaItem[];
  shorts?: MediaItem[];
}

export default function ChannelPage() {
  const { handle } = useParams<{ handle: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [overview, setOverview] = useState<ChannelOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts'>('videos');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setError(null);

    // Fetch channel details by handle
    fetch(`${API_URL}/api/channels/handle/${handle}`)
      .then(res => {
        if (!res.ok) throw new Error('Channel not found');
        return res.json();
      })
      .then((data: unknown) => setChannel(data as Channel))
      .catch(() => setError('Channel not found'))
      .finally(() => setLoading(false));
  }, [handle]);

  useEffect(() => {
    if (!channel?.id) return;
    // Fetch channel overview (videos, shorts, stats)
    fetch(`${API_URL}/api/channels/${channel.id}/overview`)
      .then(res => res.json())
      .then((data: unknown) => setOverview(data as ChannelOverview))
      .catch(() => {});
  }, [channel?.id]);

  useEffect(() => {
    if (!channel?.id) return;
    // Optionally, check if user is subscribed
    fetch(`${API_URL}/api/channels/${channel.id}/stats`)
      .then(res => res.json())
      .then(data => setSubscribed(Boolean(data?.stats?.isSubscribed)))
      .catch(() => {});
  }, [channel?.id]);

  const handleSubscribe = async () => {
    if (!channel?.id) return;
    setSubLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/channels/${channel.id}/follow`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        setSubscribed(prev => !prev);
      }
    } catch {}
    setSubLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading channel...</span>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-red-600 dark:text-red-400 font-semibold">{error || 'Channel not found.'}</p>
        <Link href="/channels" className="mt-4 text-blue-600 hover:underline">Browse channels</Link>
      </div>
    );
  }

  // Channel stats
  const stats = overview?.stats || {};
  const videos = overview?.videos || [];
  const shorts = overview?.shorts || [];

  // Ensure handle starts with @
  const displayHandle = channel.handle?.startsWith('@') ? channel.handle : `@${channel.handle}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        <main className="flex-1 min-w-0">
          {/* Channel Banner */}
          <div className="relative w-full h-48 sm:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            {/* Avatar overlaps banner */}
            <div className="absolute left-8 bottom-[-48px] z-10">
              <AuthenticatedImage
                mediaKey={getImageSrc(channel.avatar, '480w')}
                alt={channel.name}
                width={96}
                height={96}
                className="rounded-full border-4 border-white shadow-lg bg-white"
                fallbackSrc="/placeholder.png"
              />
            </div>
          </div>

          {/* Spacer for avatar overlap */}
          <div className="h-16" />

          {/* Channel Details below avatar */}
          <div className="px-8 mt-2 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{channel.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{displayHandle}</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-xl">{channel.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <FiUsers className="w-4 h-4" />
                    {stats.subscriberCount || 0} subscribers
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <FiVideo className="w-4 h-4" />
                    {stats.videoCount || videos.length} videos
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <FiPlay className="w-4 h-4" />
                    {stats.shortCount || shorts.length} shorts
                  </span>
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`ml-8 px-6 py-2 rounded-full font-semibold shadow transition ${
                  subscribed
                    ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {subscribed ? (
                  <span className="flex items-center gap-2"><FiBell /> Subscribed</span>
                ) : (
                  <span className="flex items-center gap-2"><FiBell /> Subscribe</span>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 px-8">
            <button
              className={`pb-2 font-semibold transition ${
                activeTab === 'videos'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('videos')}
            >
              Videos
            </button>
            <button
              className={`pb-2 font-semibold transition ${
                activeTab === 'shorts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('shorts')}
            >
              Shorts
            </button>
          </div>

          {/* Videos Section */}
          {activeTab === 'videos' && (
            <section className="mb-10 px-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiVideo className="w-5 h-5" /> Videos
              </h2>
              {videos.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No videos uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {videos.map((video: MediaItem) => (
                    <Link key={video.id} href={`/watch/${video.id}`}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
                        <div className="relative">
                          <AuthenticatedImage
                            mediaKey={getImageSrc(video.thumbnail, '480w')}
                            alt={video.title}
                            width={320}
                            height={180}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                            fallbackSrc="/placeholder-video.jpg"
                          />
                          {video.duration && (
                            <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                              {video.duration}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {video.views} views • {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Shorts Section */}
          {activeTab === 'shorts' && (
            <section className="mb-10 px-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiPlay className="w-5 h-5" /> Shorts
              </h2>
              {shorts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No shorts uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {shorts.map((short: MediaItem) => (
                    <Link key={short.id} href={`/shorts/${short.id}`}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
                        <div className="relative">
                          <AuthenticatedImage
                            mediaKey={getImageSrc(short.thumbnail, '480w')}
                            alt={short.title}
                            width={180}
                            height={320}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                            fallbackSrc="/placeholder-video.jpg"
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{short.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {short.views} views • {short.publishedAt ? new Date(short.publishedAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}