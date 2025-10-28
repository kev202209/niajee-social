'use client';

import { 
  FiUsers, 
  FiVideo, 
  FiFlag, 
  FiMail, 
  FiFileText, 
  FiMessageSquare,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiBook,
  FiEye,
  FiHeart,
  FiMonitor,
  FiShield,
  FiActivity,
} from 'react-icons/fi';
import { formatCount } from '@/utils/formatUtils';

interface DashboardApiResponse {
  overview: {
    totalUsers: number;
    totalContent: number;
    totalVideos: number;
    totalShorts: number;
    totalPosts: number;
    totalBlogs: number;
    totalChannels: number;
    totalCommunities: number;
    totalContacts: number;
  };
  engagement: {
    totalViews: string;
    totalVideoViews: string;
    totalShortViews: string;
    totalBlogViews: string;
    totalLikes: string;
    totalShares: string;
    totalComments: number;
    avgEngagementRate: number;
  };
  users: {
    total: number;
    active: number;
    verified: number;
    suspended: number;
    banned: number;
    private: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growthWeekPercent: number;
    growthMonthPercent: number;
    activityRate: number;
  };
  content: {
    totalActive: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
    flagged: number;
    featured: number;
    growthWeekPercent: number;
  };
  channels: {
    total: number;
    verified: number;
    monetized: number;
    verificationRate: number;
    monetizationRate: number;
  };
  moderation: {
    pendingReports: number;
    pendingVideoReports: number;
    pendingShortReports: number;
    pendingPostReports: number;
    pendingBlogReports: number;
    resolvedToday: number;
    flaggedContent: number;
    hiddenComments: number;
    inactiveContent: number;
  };
  system: {
    unprocessedContacts: number;
    serverUptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    timestamp: string;
  };
  topPerformers: {
    videos: Array<{
      id: string;
      title: string;
      viewCount: number;
      channelName: string;
      ownerUsername: string;
    }>;
    shorts: Array<{
      id: string;
      title: string;
      viewCount: number;
      channelName: string;
      ownerUsername: string;
    }>;
    posts: Array<{
      id: string;
      content?: string;
      author?: string;
      likesCount?: number;
      commentsCount?: number;
    }>;
    blogs: Array<{
      id: string;
      title: string;
      viewCount: number;
      authorUsername: string;
    }>;
    users: Array<{
      id: string;
      username?: string;
      displayName?: string;
      followerCount?: number;
    }>;
  };
  alerts: {
    criticalIssues: Array<{
      id: string;
      message?: string;
      severity?: 'critical' | 'warning' | 'info';
    }>;
    pendingReports: number;
    unprocessedContacts: number;
    flaggedContent: number;
  };
}

interface AdminDashboardProps {
  stats: DashboardApiResponse | null;
  loading: boolean;
}

export default function AdminDashboard({ stats, loading }: AdminDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <FiActivity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No dashboard data available</p>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers,
      icon: FiUsers,
      color: 'blue',
      trend: stats.users.growthMonthPercent > 0 ? `+${stats.users.growthMonthPercent}%` : null,
      subtitle: `${stats.users.newThisMonth} new this month`
    },
    {
      title: 'Total Content',
      value: stats.overview.totalContent,
      icon: FiFileText,
      color: 'green',
      trend: stats.content.growthWeekPercent > 0 ? `+${stats.content.growthWeekPercent}%` : null,
      subtitle: `${stats.content.createdThisWeek} created this week`
    },
    {
      title: 'Total Views',
      value: parseInt(stats.engagement.totalViews),
      icon: FiEye,
      color: 'purple',
      subtitle: `${stats.engagement.avgEngagementRate}% engagement rate`
    },
    {
      title: 'Total Engagement',
      value: parseInt(stats.engagement.totalLikes) + parseInt(stats.engagement.totalShares) + stats.engagement.totalComments,
      icon: FiHeart,
      color: 'pink',
      subtitle: 'Likes, shares & comments'
    }
  ];

  const contentCards = [
    {
      title: 'Videos',
      value: stats.overview.totalVideos,
      icon: FiVideo,
      color: 'red',
      views: stats.engagement.totalVideoViews
    },
    {
      title: 'Shorts',
      value: stats.overview.totalShorts,
      icon: FiVideo,
      color: 'orange',
      views: stats.engagement.totalShortViews
    },
    {
      title: 'Posts',
      value: stats.overview.totalPosts,
      icon: FiMessageSquare,
      color: 'indigo',
      views: '0'
    },
    {
      title: 'Blogs',
      value: stats.overview.totalBlogs,
      icon: FiBook,
      color: 'teal',
      views: stats.engagement.totalBlogViews
    }
  ];

  const alertCards = [
    {
      title: 'Pending Reports',
      value: stats.moderation.pendingReports,
      icon: FiFlag,
      color: 'red',
      urgent: stats.moderation.pendingReports > 0,
      subtitle: `${stats.moderation.resolvedToday} resolved today`
    },
    {
      title: 'Unprocessed Contacts',
      value: stats.system.unprocessedContacts,
      icon: FiMail,
      color: 'yellow',
      urgent: stats.system.unprocessedContacts > 0,
      subtitle: 'Customer inquiries'
    },
    {
      title: 'Flagged Content',
      value: stats.moderation.flaggedContent,
      icon: FiShield,
      color: 'orange',
      urgent: stats.moderation.flaggedContent > 0,
      subtitle: 'Requires review'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      yellow: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      indigo: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
      orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
      pink: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/20',
      teal: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewCards.map((card, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCount(card.value)}
                  </p>
                  {card.trend && (
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <FiTrendingUp className="w-3 h-3 mr-1" />
                      {card.trend}
                    </p>
                  )}
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentCards.map((card, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCount(card.value)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatCount(parseInt(card.views))} views
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channels Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Channels</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCount(stats.channels.total)}
                </p>
              </div>
              <div className="p-3 rounded-full text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Channels</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCount(stats.channels.verified)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.channels.verificationRate}% verified
                </p>
              </div>
              <div className="p-3 rounded-full text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20">
                <FiCheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monetized Channels</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCount(stats.channels.monetized)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.channels.monetizationRate}% monetized
                </p>
              </div>
              <div className="p-3 rounded-full text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20">
                <FiTrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Moderation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alerts & Moderation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alertCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 ${
                card.urgent ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCount(card.value)}
                  </p>
                  {card.urgent && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                      <FiAlertTriangle className="w-3 h-3 mr-1" />
                      Needs attention
                    </p>
                  )}
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Top Videos</h4>
            </div>
            <div className="p-6">
              {stats.topPerformers.videos.length > 0 ? (
                <div className="space-y-4">
                  {stats.topPerformers.videos.map((video) => (
                     <div key={video.id} className="flex items-center justify-between">
                      <div className="flex-1 truncate">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {video.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {video.ownerUsername}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCount(video.viewCount)} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No videos yet</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Top Shorts</h4>
            </div>
            <div className="p-6">
              {stats.topPerformers.shorts.length > 0 ? (
                <div className="space-y-4">
                  {stats.topPerformers.shorts.map((short) => (
                    <div key={short.id} className="flex items-center justify-between">
                      <div className="flex-1 truncate">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {short.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {short.ownerUsername}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCount(short.viewCount)} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No shorts yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-3">
                <FiMonitor className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(stats.system.serverUptime / 60)} minutes
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-3">
                <FiActivity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(stats.system.memoryUsage.heapUsed / 1024 / 1024)} MB
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-3">
                <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.users.active}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}