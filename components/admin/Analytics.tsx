'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiVideo, 
  FiEye,
  FiHeart,
  FiBarChart2,
  FiActivity,
} from 'react-icons/fi';
import { formatCount } from '@/utils/formatCount';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalVideos: number;
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    userGrowth: number;
    videoGrowth: number;
    engagementRate: number;
  };
  userStats: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    averageSessionTime: number;
  };
  contentStats: {
    videosUploaded: number;
    postsCreated: number;
    commentsPosted: number;
    likesGiven: number;
    sharesCount: number;
  };
  topContent: {
    videos: Array<{
      id: string;
      title: string;
      author: string;
      views: number;
      likes: number;
      createdAt: string;
    }>;
    posts: Array<{
      id: string;
      content: string;
      author: string;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
    }>;
  };
  engagement: {
    averageWatchTime: number;
    bounceRate: number;
    commentsPerVideo: number;
    likesPerVideo: number;
    sharesPerVideo: number;
  };
  trends: {
    dailyActiveUsers: Array<{
      date: string;
      count: number;
    }>;
    contentUploads: Array<{
      date: string;
      videos: number;
      posts: number;
    }>;
  };
}

interface AnalyticsProps {
  userRole: string;
}

export default function Analytics({ userRole }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics?period=${period}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err: unknown) {
      console.error('Error fetching analytics:', err);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'super_admin') {
      void fetchAnalytics();
    }
  }, [period, userRole, fetchAnalytics]);

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Only admins can view detailed analytics.
        </p>
      </div>
    );
  }

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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <FiActivity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Analytics data is not available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform performance and user engagement metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCount(analytics.overview.totalUsers)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-3 h-3 mr-1" />
                +{analytics.overview.userGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCount(analytics.overview.totalVideos)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-3 h-3 mr-1" />
                +{analytics.overview.videoGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <FiVideo className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCount(analytics.overview.totalViews)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <FiEye className="w-3 h-3 mr-1" />
                {analytics.overview.engagementRate.toFixed(1)}% engagement
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <FiEye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCount(analytics.overview.totalLikes + analytics.overview.totalComments + analytics.overview.totalShares)}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                <FiHeart className="w-3 h-3 mr-1" />
                Likes, Comments, Shares
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <FiHeart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* User & Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.userStats.activeUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.userStats.newUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Returning Users</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.userStats.returningUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Session Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(analytics.userStats.averageSessionTime / 60)} min
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Videos Uploaded</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.contentStats.videosUploaded)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Posts Created</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.contentStats.postsCreated)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Comments Posted</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.contentStats.commentsPosted)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Likes Given</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCount(analytics.contentStats.likesGiven)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engagement Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Watch Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(analytics.engagement.averageWatchTime / 60)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.engagement.bounceRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Comments/Video</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.engagement.commentsPerVideo.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Likes/Video</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.engagement.likesPerVideo.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">User Retention</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {Math.round((analytics.userStats.returningUsers / analytics.userStats.activeUsers) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Content Quality</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {analytics.overview.engagementRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Community Activity</span>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {analytics.engagement.commentsPerVideo.toFixed(1)}/video
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                +{analytics.overview.userGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Videos</h3>
          <div className="space-y-4">
            {analytics.topContent.videos.map((video) => (
              <div key={video.id} className="flex items-center justify-between">
                <div className="flex-1 truncate">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{video.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {video.author}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCount(video.views)} views</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCount(video.likes)} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Posts</h3>
          <div className="space-y-4">
            {analytics.topContent.posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between">
                <div className="flex-1 truncate">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{post.content}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {post.author}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCount(post.likesCount)} likes</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCount(post.commentsCount)} comments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends (Chart Placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Active Users</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <FiBarChart2 className="w-12 h-12" />
            <p className="ml-2">User trend chart would be displayed here.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Uploads</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <FiTrendingUp className="w-12 h-12" />
            <p className="ml-2">Content upload trend chart would be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}