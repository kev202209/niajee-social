'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthenticatedImage from '@/components/Image';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import { FiUsers, FiVideo, FiPlay, FiBell, FiLock, FiStar } from 'react-icons/fi';
import { Channel, MediaItem, ChannelOverview, getImageSrcSafe, MembershipTier } from '@/types';
import { getImageSrc } from '@/utils/imageUtils';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import MemberBadge from '@/components/MemberBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChannelPage() {
  const { handle } = useParams<{ handle: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [overview, setOverview] = useState<ChannelOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'members'>('videos');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [members, setMembers] = useState<Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      profilePic: string | null;
    };
    tier: MembershipTier;
    joinedAt: string;
    totalSpent: number;
  }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);

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

  // Fetch members when Members tab is active
  useEffect(() => {
    if (activeTab !== 'members' || !channel?.id || !channel?.membershipEnabled) return;
    
    setMembersLoading(true);
    fetch(`${API_URL}/api/channels/${channel.id}/membership/members`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.members)) {
          setMembers(data.members);
        }
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }, [activeTab, channel?.id, channel?.membershipEnabled]);

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
          {/* Updated root: Responsive padding */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Channel Banner - Made responsive */}
            <div className="relative w-full h-32 sm:h-48 md:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {/* Avatar overlaps banner - Responsive positioning */}
              <div className="absolute left-4 sm:left-8 bottom-[-32px] sm:bottom-[-48px] z-10">
                <AuthenticatedImage
                  mediaKey={getImageSrcSafe(channel.avatar, '480w')}
                  alt={channel.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-white"
                  fallbackSrc="/placeholder.png"
                />
              </div>
            </div>

            {/* Spacer for avatar overlap - Responsive */}
            <div className="h-10 sm:h-16" />

            {/* Channel Details below avatar - Enhanced mobile layout */}
            <div className="mt-2 mb-2">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{channel.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">{displayHandle}</p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">{channel.description}</p>
                  
                  {/* Stats - Responsive flex layout */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                      {stats.subscriberCount || 0} subscribers
                    </span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <FiVideo className="w-3 h-3 sm:w-4 sm:h-4" />
                      {stats.videoCount || videos.length} videos
                    </span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <FiPlay className="w-3 h-3 sm:w-4 sm:h-4" />
                      {stats.shortCount || shorts.length} shorts
                    </span>
                    {channel.userSubscription && (
                      <>
                        <SubscriptionStatus
                          status={channel.userSubscription.status}
                          expiresAt={channel.userSubscription.expiresAt}
                          size="sm"
                        />
                        {channel.userSubscription.tier && (
                          <MemberBadge
                            tierName={channel.userSubscription.tier.name}
                            tierColor={channel.userSubscription.tier.color || '#3B82F6'}
                            size="sm"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Subscribe button - Full width on mobile */}
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                  <button
                    onClick={handleSubscribe}
                    disabled={subLoading}
                    className={`w-full lg:w-auto lg:ml-8 px-4 sm:px-6 py-2 rounded-full font-semibold shadow transition ${
                      subscribed
                        ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {subscribed ? (
                      <span className="flex items-center justify-center gap-2"><FiBell className="w-4 h-4" /> Subscribed</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><FiBell className="w-4 h-4" /> Subscribe</span>
                    )}
                  </button>
                  {channel.membershipEnabled && (
                    <Link
                      href={`/channels/${handle}/membership`}
                      className="w-full lg:w-auto lg:ml-8 px-4 sm:px-6 py-2 rounded-full font-semibold shadow transition bg-blue-600 text-white hover:bg-blue-700 text-center"
                    >
                      Join Membership
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs - Scrollable on mobile */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
              <button
                className={`pb-2 font-semibold transition whitespace-nowrap ${
                  activeTab === 'videos'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('videos')}
              >
                Videos
              </button>
              <button
                className={`pb-2 font-semibold transition whitespace-nowrap ${
                  activeTab === 'shorts'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('shorts')}
              >
                Shorts
              </button>
              {channel.membershipEnabled && (
                <button
                  className={`pb-2 font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'members'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setActiveTab('members')}
                >
                  <FiStar className="w-4 h-4" />
                  Members
                  {channel.memberCount ? ` (${channel.memberCount})` : ''}
                </button>
              )}
            </div>

            {/* Videos Section - Improved responsive grid */}
            {activeTab === 'videos' && (
              <section className="mb-10">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <FiVideo className="w-5 h-5" /> Videos
                </h2>
                {videos.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No videos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {videos.map((video: MediaItem) => (
                      <Link key={video.id} href={`/watch/${video.id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
                          <div className="relative">
                            <AuthenticatedImage
                              mediaKey={getImageSrc(video.thumbnail, '480w')}
                              alt={video.title}
                              width={320}
                              height={180}
                              className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform"
                              fallbackSrc="/placeholder-video.jpg"
                            />
                            {/* Lock icon overlay for member-only content */}
                            {video.needsMembership && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-center">
                                  <FiLock className="w-8 h-8 text-white mx-auto mb-2" />
                                  <span className="text-white text-xs font-semibold">Members Only</span>
                                </div>
                              </div>
                            )}
                            {video.duration && (
                              <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                                {video.duration}
                              </span>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex items-start gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm sm:text-base flex-1">{video.title}</h3>
                              {video.isMemberOnly && (
                                <FiLock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                              )}
                            </div>
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

            {/* Shorts Section - Better mobile grid */}
            {activeTab === 'shorts' && (
              <section className="mb-10">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <FiPlay className="w-5 h-5" /> Shorts
                </h2>
                {shorts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No shorts uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {shorts.map((short: MediaItem) => (
                      <Link key={short.id} href={`/shorts/${short.id}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
                          <div className="relative">
                            <AuthenticatedImage
                              mediaKey={getImageSrcSafe(short.thumbnail, '480w')}
                              alt={short.title}
                              width={180}
                              height={320}
                              className="w-full aspect-[9/16] object-cover group-hover:scale-105 transition-transform"
                              fallbackSrc="/placeholder-video.jpg"
                            />
                            {/* Lock icon overlay for member-only shorts */}
                            {short.needsMembership && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-center">
                                  <FiLock className="w-6 h-6 text-white mx-auto mb-1" />
                                  <span className="text-white text-xs font-semibold">Members Only</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="flex items-start gap-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-xs sm:text-sm flex-1">{short.title}</h3>
                              {short.isMemberOnly && (
                                <FiLock className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {short.views} views
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Members Section */}
            {activeTab === 'members' && (
              <section className="mb-10">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <FiStar className="w-5 h-5" /> Channel Members
                </h2>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading members...</span>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No members yet. Be the first to join!</p>
                    {channel.membershipEnabled && (
                      <Link
                        href={`/channels/${handle}/membership`}
                        className="inline-block mt-4 px-6 py-2 rounded-full font-semibold shadow transition bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Join Membership
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group members by tier */}
                    {channel.membershipTiers?.map(tier => {
                      const tierMembers = members.filter(m => m.tier.id === tier.id);
                      if (tierMembers.length === 0) return null;
                      
                      return (
                        <div key={tier.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <MemberBadge
                              tierName={tier.name}
                              tierColor={tier.color || '#3B82F6'}
                              size="md"
                              showIcon
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {tierMembers.length} {tierMembers.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tierMembers.map(member => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                              >
                                <AuthenticatedImage
                                  mediaKey={member.user.profilePic ? getImageSrc(member.user.profilePic, '480w') : '/placeholder.png'}
                                  alt={`${member.user.firstName} ${member.user.lastName}`}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                  fallbackSrc="/placeholder.png"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                    {member.user.firstName} {member.user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    @{member.user.username}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* If no tiers, show all members in a single list */}
                    {(!channel.membershipTiers || channel.membershipTiers.length === 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {members.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                          >
                            <AuthenticatedImage
                              mediaKey={member.user.profilePic ? getImageSrc(member.user.profilePic, '480w') : '/placeholder.png'}
                              alt={`${member.user.firstName} ${member.user.lastName}`}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                              fallbackSrc="/placeholder.png"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                {member.user.firstName} {member.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                @{member.user.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Member since {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}